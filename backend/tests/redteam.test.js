const assert = require('assert');
const jwt = require('jsonwebtoken');
const { request } = require('./testHelper');

async function runRedTeamTests() {
  console.log('\n🔴 [TEST SUITE 8/8]: Red-Team Adversarial Exploitation & Attack Simulation');

  // Obtain legitimate tokens for baseline
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  const adminToken = adminLogin.body.data.token;

  const owner1Login = await request('POST', '/auth/login', {
    email: 'owner.marcus@freshmart.com',
    password: 'OwnerPassword123!',
  });
  const owner1Token = owner1Login.body.data.token;

  const userLogin = await request('POST', '/auth/login', {
    email: 'sarah.jenkins@example.com',
    password: 'UserPassword123!',
  });
  const userToken = userLogin.body.data.token;

  // =========================================================================
  // 1. JWT ATTACK TESTING
  // =========================================================================
  console.log('   --- 1. JWT Attack Scenarios ---');

  // 1.1 Missing Token
  const missingRes = await request('GET', '/auth/me', null, null);
  assert.strictEqual(missingRes.status, 401, 'Missing token must return 401');
  console.log('   ✅ 1.1 Missing JWT Header Rejected (401 Unauthorized)');

  // 1.2 Empty / Whitespace Token
  const emptyTokenRes = await request('GET', '/auth/me', null, '   ');
  assert.strictEqual(emptyTokenRes.status, 401, 'Empty token must return 401');
  console.log('   ✅ 1.2 Empty / Whitespace Token Rejected (401 Unauthorized)');

  // 1.3 Random Malformed Token
  const malformedRes = await request('GET', '/auth/me', null, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature');
  assert.strictEqual(malformedRes.status, 401, 'Malformed token must return 401');
  console.log('   ✅ 1.3 Malformed Base64 Token Rejected (401 Unauthorized)');

  // 1.4 Forged Token Signed with Wrong Secret
  const forgedToken = jwt.sign(
    { id: 1, email: 'admin@storerating.com', role: 'SYSTEM_ADMIN' },
    'attacker_private_secret_key_12345',
    { algorithm: 'HS256', expiresIn: '1h', issuer: 'store-rating-platform', audience: 'store-rating-client' }
  );
  const forgedRes = await request('GET', '/dashboard/admin', null, forgedToken);
  assert.strictEqual(forgedRes.status, 401, 'Forged signature must return 401');
  console.log('   ✅ 1.4 Forged JWT (Wrong HMAC Secret) Rejected (401 Unauthorized)');

  // 1.5 Algorithm Confusion: Token with algorithm 'none'
  const noneAlgToken = jwt.sign(
    { id: 1, email: 'admin@storerating.com', role: 'SYSTEM_ADMIN' },
    '',
    { algorithm: 'none' }
  );
  const noneAlgRes = await request('GET', '/dashboard/admin', null, noneAlgToken);
  assert.strictEqual(noneAlgRes.status, 401, 'Algorithm "none" must return 401');
  console.log('   ✅ 1.5 Algorithm Confusion (alg: "none") Rejected (401 Unauthorized)');

  // 1.6 Expired Token
  const expiredToken = jwt.sign(
    { id: 1, email: 'admin@storerating.com', role: 'SYSTEM_ADMIN' },
    process.env.JWT_SECRET || 'dev_super_secret_store_rating_jwt_key_2026',
    { algorithm: 'HS256', expiresIn: '-10s', issuer: 'store-rating-platform', audience: 'store-rating-client' }
  );
  const expiredRes = await request('GET', '/dashboard/admin', null, expiredToken);
  assert.strictEqual(expiredRes.status, 401, 'Expired token must return 401');
  console.log('   ✅ 1.6 Expired JWT Token Rejected (401 Unauthorized)');

  // 1.7 Tampered Payload (Modified Role from NORMAL_USER -> SYSTEM_ADMIN without resigning)
  const tokenParts = userToken.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ id: 3, email: 'sarah.jenkins@example.com', role: 'SYSTEM_ADMIN' })).toString('base64url');
  const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`;
  const tamperedRes = await request('GET', '/dashboard/admin', null, tamperedToken);
  assert.strictEqual(tamperedRes.status, 401, 'Tampered payload with invalid signature must return 401');
  console.log('   ✅ 1.7 Tampered Payload Token Rejected Cryptographically (401 Unauthorized)');

  // =========================================================================
  // 2. VERTICAL & HORIZONTAL PRIVILEGE ESCALATION
  // =========================================================================
  console.log('   --- 2. Privilege Escalation & IDOR / BOLA Attacks ---');

  // 2.1 Normal User Attempting Admin Dashboard Access
  const vertAdminDash = await request('GET', '/dashboard/admin', null, userToken);
  assert.strictEqual(vertAdminDash.status, 403);
  console.log('   ✅ 2.1 Vertical Escalation: Normal User -> Admin Dashboard (403 Forbidden)');

  // 2.2 Normal User Attempting Privileged User Creation
  const vertCreateUser = await request('POST', '/users', {
    name: 'Privileged Escalation Admin Account',
    email: `priv_esc_${Date.now()}@example.com`,
    password: 'AdminPassword123!',
    role: 'SYSTEM_ADMIN',
  }, userToken);
  assert.strictEqual(vertCreateUser.status, 403);
  console.log('   ✅ 2.2 Vertical Escalation: Normal User -> Create Admin User (403 Forbidden)');

  // 2.3 Store Owner Attempting Store Creation (Admin-Only API)
  const ownerStoreCreate = await request('POST', '/stores', {
    name: 'Unauthorized Merchant Direct Creation',
    email: 'unauth_merchant@example.com',
    address: '456 Business Highway, Suite 100',
  }, owner1Token);
  assert.strictEqual(ownerStoreCreate.status, 403);
  console.log('   ✅ 2.3 Vertical Escalation: Store Owner -> Store Creation (403 Forbidden)');

  // 2.4 BOLA: Store Owner 1 Attempting to Access Store 2 Analytics
  const bolaStats = await request('GET', '/dashboard/owner/statistics?storeId=2', null, owner1Token);
  assert.strictEqual(bolaStats.status, 403);
  console.log('   ✅ 2.4 Horizontal Isolation (BOLA): Store Owner -> Competitor Telemetry (403 Forbidden)');

  // 2.5 BOLA: Store Owner 1 Attempting to Read Store 2 Customer Feedback
  const bolaFeedback = await request('GET', '/ratings/store/2', null, owner1Token);
  assert.strictEqual(bolaFeedback.status, 403);
  console.log('   ✅ 2.5 Horizontal Isolation (BOLA): Store Owner -> Competitor Ratings Feed (403 Forbidden)');

  // 2.6 IDOR: Normal User Attempting to Inspect Arbitrary User Record
  const idorUser = await request('GET', '/users/2', null, userToken);
  assert.strictEqual(idorUser.status, 403);
  console.log('   ✅ 2.6 IDOR: Normal User -> /users/:id Probing (403 Forbidden)');

  // =========================================================================
  // 3. BUSINESS LOGIC & INPUT BOUNDARY ATTACKS
  // =========================================================================
  console.log('   --- 3. Business Logic & Input Boundary Attacks ---');

  // 3.1 Rating Out of Bounds: Value = 0
  const rateZero = await request('POST', '/ratings', { storeId: 1, rating: 0 }, userToken);
  assert.strictEqual(rateZero.status, 400);
  console.log('   ✅ 3.1 Business Logic: Rating value = 0 rejected (400 Bad Request)');

  // 3.2 Rating Out of Bounds: Value = 6
  const rateSix = await request('POST', '/ratings', { storeId: 1, rating: 6 }, userToken);
  assert.strictEqual(rateSix.status, 400);
  console.log('   ✅ 3.2 Business Logic: Rating value = 6 rejected (400 Bad Request)');

  // 3.3 Rating Out of Bounds: Negative Value
  const rateNeg = await request('POST', '/ratings', { storeId: 1, rating: -5 }, userToken);
  assert.strictEqual(rateNeg.status, 400);
  console.log('   ✅ 3.3 Business Logic: Rating value = -5 rejected (400 Bad Request)');

  // 3.4 Non-Existent Store ID
  const rateNonExistent = await request('POST', '/ratings', { storeId: 999999, rating: 5 }, userToken);
  assert.ok([400, 404].includes(rateNonExistent.status), 'Non-existent store rating rejected');
  console.log('   ✅ 3.4 Business Logic: Rating non-existent store rejected (404/400)');

  // 3.5 Name Length Boundary: < 20 characters
  const shortName = await request('POST', '/auth/register', {
    name: 'Short Name',
    email: `short_${Date.now()}@example.com`,
    password: 'Password123!',
  });
  assert.strictEqual(shortName.status, 400);
  console.log('   ✅ 3.5 Input Boundary: Name < 20 chars rejected (400 Bad Request)');

  // 3.6 Password Complexity Boundary: Missing special character
  const noSpecialPass = await request('POST', '/auth/register', {
    name: 'Valid Name Longer Than Twenty Characters',
    email: `nospec_${Date.now()}@example.com`,
    password: 'Password123',
  });
  assert.strictEqual(noSpecialPass.status, 400);
  console.log('   ✅ 3.6 Input Boundary: Password missing special char rejected (400 Bad Request)');

  // 3.7 Password Complexity Boundary: Missing uppercase letter
  const noUpperPass = await request('POST', '/auth/register', {
    name: 'Valid Name Longer Than Twenty Characters',
    email: `noupper_${Date.now()}@example.com`,
    password: 'password123!',
  });
  assert.strictEqual(noUpperPass.status, 400);
  console.log('   ✅ 3.7 Input Boundary: Password missing uppercase rejected (400 Bad Request)');

  // =========================================================================
  // 4. SQL INJECTION & XSS ATTACKS
  // =========================================================================
  console.log('   --- 4. SQL Injection & XSS Attack Simulation ---');

  // 4.1 SQLi: Parameterized Search with SQL Injection payload
  const sqliRes = await request('GET', '/stores?search=\' OR \'1\'=\'1\' --');
  assert.strictEqual(sqliRes.status, 200, 'Search handles SQL injection string safely');
  console.log('   ✅ 4.1 SQLi Attack: Parameterized search handles quotes & comment dashes safely');

  // 4.2 SQLi: Dynamic Order By with SQL Payload
  const sqliSort = await request('GET', '/stores?sortBy=(SELECT CASE WHEN (1=1) THEN name ELSE email END)');
  assert.strictEqual(sqliSort.status, 400, 'Non-allowlisted sort expression rejected');
  console.log('   ✅ 4.2 SQLi Attack: Complex SQL function injection in sortBy rejected (400 Bad Request)');

  // 4.3 XSS: Script tag injection in address update
  const xssPayload = '<img src=x onerror=alert(1)> Apt 4B';
  const xssProfile = await request('PATCH', '/users/profile', { address: xssPayload }, userToken);
  assert.strictEqual(xssProfile.status, 200);
  assert.strictEqual(xssProfile.body.data.address, xssPayload, 'Stored as literal string without evaluation');
  console.log('   ✅ 4.3 XSS Attack: HTML tags safely stored and handled as benign literal text');

  // =========================================================================
  // 5. SESSION REVOCATION & POST-LOGOUT DEFENSE
  // =========================================================================
  console.log('   --- 5. Session Revocation & Invalidation ---');

  // Login temp user, logout, and attempt immediate reuse
  const tempUserLogin = await request('POST', '/auth/login', {
    email: 'david.kim@example.com',
    password: 'UserPassword123!',
  });
  const tempToken = tempUserLogin.body.data.token;

  // Verify access before logout
  const preLogout = await request('GET', '/auth/me', null, tempToken);
  assert.strictEqual(preLogout.status, 200);

  // Logout
  const doLogout = await request('POST', '/auth/logout', null, tempToken);
  assert.strictEqual(doLogout.status, 200);

  // Verify rejection after logout
  const postLogout = await request('GET', '/auth/me', null, tempToken);
  assert.strictEqual(postLogout.status, 401, 'Logged out token must be rejected');
  console.log('   ✅ 5.1 Session Revocation: Replayed token after logout strictly rejected (401 Unauthorized)');
}

module.exports = runRedTeamTests;
