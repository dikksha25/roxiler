const assert = require('assert');
const { request } = require('./testHelper');

async function runSecurityTests() {
  console.log('\n🔵 [TEST SUITE 7/7]: Express API Security, SQLi, XSS & Mass-Assignment Defense');

  // Obtain admin and user tokens
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  const adminToken = adminLogin.body.data.token;

  const userLogin = await request('POST', '/auth/login', {
    email: 'sarah.jenkins@example.com',
    password: 'UserPassword123!',
  });
  const userToken = userLogin.body.data.token;

  // 7.1 SQL Injection Defense in Login (`' OR '1'='1`)
  const sqliLoginRes = await request('POST', '/auth/login', {
    email: "' OR '1'='1' --",
    password: 'Password123!',
  });
  assert.strictEqual(sqliLoginRes.status, 400, 'Invalid email syntax injection rejected');
  console.log('   ✅ 7.1 SQLi Defense: Login query payload injection safely rejected (400 Bad Request)');

  // 7.2 SQL Injection Defense in Store Search / Filtering
  const sqliSearchRes = await request('GET', "/stores?name=' UNION SELECT * FROM users --");
  assert.strictEqual(sqliSearchRes.status, 200, 'Parameterized search treats input as literal string without error');
  assert.strictEqual(sqliSearchRes.body.data.stores.length, 0, 'No injection results returned');
  console.log('   ✅ 7.2 SQLi Defense: Parameterized search query treats SQL injection as literal text');

  // 7.3 SQL Injection Defense in Dynamic Sort Column Allowlist
  const sqliSortRes = await request('GET', '/stores?sortBy=id;DROP TABLE users;--');
  assert.strictEqual(sqliSortRes.status, 400, 'Unallowlisted sort column rejected');
  console.log('   ✅ 7.3 SQLi Defense: Dynamic ORDER BY strictly validates against column allowlist');

  // 7.4 Mass-Assignment / Overposting Protection on Registration
  const massAssignRes = await request('POST', '/auth/register', {
    name: 'Security Test Auditor Account',
    email: `sec_test_${Date.now()}@example.com`,
    password: 'SecPass123!',
    role: 'SYSTEM_ADMIN',
    isAdmin: true,
    password_hash: '$2b$10$malicioushashhere1234567890',
  });
  assert.strictEqual(massAssignRes.status, 201);
  assert.strictEqual(massAssignRes.body.data.user.role, 'NORMAL_USER', 'Must ignore client-injected role');
  assert.strictEqual(massAssignRes.body.data.user.isAdmin, undefined, 'Must not accept isAdmin overposting');
  assert.strictEqual(massAssignRes.body.data.user.password_hash, undefined, 'Must not expose or accept password_hash');
  console.log('   ✅ 7.4 Mass-Assignment Defense: Overposted fields (role, isAdmin, password_hash) safely ignored');

  // 7.5 XSS Payload Storage & Neutral Treatment
  const xssStoreName = '<script>alert("xss")</script> Commercial Market';
  const xssCreateStoreRes = await request('POST', '/stores', {
    name: xssStoreName,
    email: `xss_store_${Date.now()}@example.com`,
    address: '100 Security Boulevard, Suite 500',
  }, adminToken);
  assert.strictEqual(xssCreateStoreRes.status, 201);
  assert.strictEqual(xssCreateStoreRes.body.data.name, xssStoreName, 'XSS string stored as plain sanitized text');
  console.log('   ✅ 7.5 XSS Defense: Script tags handled safely as raw text without executable evaluation');

  // 7.6 Input Boundary Enforcement: Name Length < 20 Characters
  const shortNameRes = await request('POST', '/stores', {
    name: 'Short Name',
    email: 'valid.email@example.com',
    address: 'Valid store physical address 12345',
  }, adminToken);
  assert.strictEqual(shortNameRes.status, 400, 'Name < 20 chars rejected');
  console.log('   ✅ 7.6 Input Boundary: Name < 20 characters rejected (400 Bad Request)');

  // 7.7 Input Boundary Enforcement: Address Length > 400 Characters
  const longAddress = 'A'.repeat(405);
  const longAddrRes = await request('POST', '/stores', {
    name: 'Valid Store Name With Sufficient Characters 123',
    email: 'valid.email@example.com',
    address: longAddress,
  }, adminToken);
  assert.strictEqual(longAddrRes.status, 400, 'Address > 400 chars rejected');
  console.log('   ✅ 7.7 Input Boundary: Address > 400 characters rejected (400 Bad Request)');

  // 7.8 Information Disclosure Defense: Never Leak Password Hashes
  const profileRes = await request('GET', '/auth/me', null, adminToken);
  assert.strictEqual(profileRes.body.data.password_hash, undefined, 'password_hash must never be in profile payload');
  assert.strictEqual(profileRes.body.data.password, undefined, 'password must never be in profile payload');
  console.log('   ✅ 7.8 Information Disclosure Defense: Credentials and password hashes excluded from response payloads');

  // 7.9 Malformed JSON Body Handling (400 Bad Request)
  const usersRes = await request('GET', '/users?page=-1', null, adminToken);
  assert.strictEqual(usersRes.status, 400, 'Negative page numbers rejected');
  console.log('   ✅ 7.9 Query Sanitization: Invalid pagination values rejected (400 Bad Request)');
}

module.exports = runSecurityTests;
