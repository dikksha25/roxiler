const assert = require('assert');
const { request } = require('./testHelper');

async function runAuthTests() {
  console.log('\n🔵 [TEST SUITE 1/6]: Authentication & Session Management');

  // 1.1 Successful Login - SYSTEM_ADMIN
  const adminRes = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  assert.strictEqual(adminRes.status, 200, 'Admin login should return 200 OK');
  assert.strictEqual(adminRes.body.success, true);
  assert.ok(adminRes.body.data.token, 'Should return JWT token');
  assert.strictEqual(adminRes.body.data.user.role, 'SYSTEM_ADMIN');
  assert.strictEqual(adminRes.body.data.user.password_hash, undefined, 'Must not return password_hash');
  assert.strictEqual(adminRes.body.data.user.password, undefined, 'Must not return password');
  console.log('   ✅ 1.1 Successful Login: SYSTEM_ADMIN');

  // 1.2 Successful Login - STORE_OWNER
  const ownerRes = await request('POST', '/auth/login', {
    email: 'owner.marcus@freshmart.com',
    password: 'OwnerPassword123!',
  });
  assert.strictEqual(ownerRes.status, 200, 'Store Owner login should return 200 OK');
  assert.strictEqual(ownerRes.body.data.user.role, 'STORE_OWNER');
  assert.strictEqual(ownerRes.body.data.user.password_hash, undefined, 'Must not return password_hash');
  console.log('   ✅ 1.2 Successful Login: STORE_OWNER');

  // 1.3 Successful Login - NORMAL_USER
  const userRes = await request('POST', '/auth/login', {
    email: 'sarah.jenkins@example.com',
    password: 'UserPassword123!',
  });
  assert.strictEqual(userRes.status, 200, 'Normal user login should return 200 OK');
  assert.strictEqual(userRes.body.data.user.role, 'NORMAL_USER');
  assert.strictEqual(userRes.body.data.user.password_hash, undefined, 'Must not return password_hash');
  console.log('   ✅ 1.3 Successful Login: NORMAL_USER');

  // 1.4 Invalid Email
  const invalidEmailRes = await request('POST', '/auth/login', {
    email: 'nonexistent.user999@example.com',
    password: 'SomePassword123!',
  });
  assert.strictEqual(invalidEmailRes.status, 401, 'Invalid email should return 401 Unauthorized');
  assert.strictEqual(invalidEmailRes.body.success, false);
  console.log('   ✅ 1.4 Invalid Email Rejection (401 Unauthorized)');

  // 1.5 Invalid Password
  const invalidPassRes = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'WrongPassword999!',
  });
  assert.strictEqual(invalidPassRes.status, 401, 'Invalid password should return 401 Unauthorized');
  assert.strictEqual(invalidPassRes.body.success, false);
  console.log('   ✅ 1.5 Invalid Password Rejection (401 Unauthorized)');

  // 1.6 Missing Credentials
  const missingCredsRes = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
  });
  assert.strictEqual(missingCredsRes.status, 400, 'Missing password should return 400 Bad Request');
  console.log('   ✅ 1.6 Missing Credentials Validation (400 Bad Request)');

  // 1.7 Missing Token on Protected Route (/auth/me)
  const missingTokenRes = await request('GET', '/auth/me');
  assert.strictEqual(missingTokenRes.status, 401, 'Missing token should return 401 Unauthorized');
  console.log('   ✅ 1.7 Protected Route without Token (401 Unauthorized)');

  // 1.8 Malformed Token on Protected Route
  const malformedTokenRes = await request('GET', '/auth/me', null, 'malformed.jwt.token');
  assert.strictEqual(malformedTokenRes.status, 401, 'Malformed token should return 401 Unauthorized');
  console.log('   ✅ 1.8 Malformed JWT Token Rejection (401 Unauthorized)');

  // 1.9 Valid Token /auth/me Profile Retrieval
  const meRes = await request('GET', '/auth/me', null, adminRes.body.data.token);
  assert.strictEqual(meRes.status, 200, 'Valid token /auth/me should return 200 OK');
  assert.strictEqual(meRes.body.data.email, 'admin@storerating.com');
  assert.strictEqual(meRes.body.data.password_hash, undefined, 'Never expose password_hash');
  console.log('   ✅ 1.9 Session Profile Rehydration (/auth/me)');

  // 1.10 Logout & Revocation
  const logoutRes = await request('POST', '/auth/logout', null, adminRes.body.data.token);
  assert.strictEqual(logoutRes.status, 200, 'Logout should return 200 OK');
  console.log('   ✅ 1.10 Logout Endpoint Confirmation (200 OK)');

  // 1.11 Revoked Token Access Blocked After Logout
  const postLogoutMe = await request('GET', '/auth/me', null, adminRes.body.data.token);
  assert.strictEqual(postLogoutMe.status, 401, 'Revoked token must be rejected with 401 Unauthorized');
  console.log('   ✅ 1.11 Revoked JWT Token Rejected After Logout (401 Unauthorized)');
}

module.exports = runAuthTests;
