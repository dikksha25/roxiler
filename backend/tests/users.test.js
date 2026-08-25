const assert = require('assert');
const { request } = require('./testHelper');

async function runUsersTests() {
  console.log('\n🔵 [TEST SUITE 3/6]: Users Management & Validation');

  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  const adminToken = adminLogin.body.data.token;

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 3.1 Normal User Self-Registration
  const regEmail = `user.test.${rand}@example.com`;
  const regRes = await request('POST', '/auth/register', {
    name: `Test Registered Consumer ${rand}`,
    email: regEmail,
    password: 'UserPass123!',
    address: '100 Consumer Boulevard, Cityville',
  });
  assert.strictEqual(regRes.status, 201, 'Self-registration should return 201 Created');
  assert.strictEqual(regRes.body.data.user.role, 'NORMAL_USER', 'Public registration must always enforce NORMAL_USER');
  console.log('   ✅ 3.1 Normal User Self-Registration (201 Created)');

  // 3.2 Duplicate Email Rejection (409 Conflict)
  const dupRes = await request('POST', '/auth/register', {
    name: `Another User Name Long Enough ${rand}`,
    email: regEmail,
    password: 'UserPass123!',
  });
  assert.strictEqual(dupRes.status, 409, 'Duplicate email must return 409 Conflict');
  console.log('   ✅ 3.2 Duplicate Email Rejection (409 Conflict)');

  // 3.3 Admin Creates a New STORE_OWNER User (12 chars password)
  const ownerEmail = `owner.created.${rand}@example.com`;
  const createOwnerRes = await request('POST', '/users', {
    name: `Created Store Owner ${rand}`,
    email: ownerEmail,
    password: 'OwnerPass123!',
    address: '200 Commercial Way',
    role: 'STORE_OWNER',
  }, adminToken);
  assert.strictEqual(createOwnerRes.status, 201);
  assert.strictEqual(createOwnerRes.body.data.role, 'STORE_OWNER');
  console.log('   ✅ 3.3 Admin Created STORE_OWNER User (201 Created)');

  // 3.4 Admin Creates a New SYSTEM_ADMIN User
  const newAdminRes = await request('POST', '/users', {
    name: `Secondary Platform Admin ${rand}`,
    email: `admin.created.${rand}@example.com`,
    password: 'AdminPass123!',
    address: '300 Executive Tower',
    role: 'SYSTEM_ADMIN',
  }, adminToken);
  assert.strictEqual(newAdminRes.status, 201);
  assert.strictEqual(newAdminRes.body.data.role, 'SYSTEM_ADMIN');
  console.log('   ✅ 3.4 Admin Created SYSTEM_ADMIN User (201 Created)');

  // 3.5 Invalid Name (< 20 characters) Rejection
  const shortNameRes = await request('POST', '/users', {
    name: 'Short Name',
    email: `bad.name.${rand}@example.com`,
    password: 'Password123!',
    role: 'NORMAL_USER',
  }, adminToken);
  assert.strictEqual(shortNameRes.status, 400);
  console.log('   ✅ 3.5 Name < 20 Characters Rejection (400 Bad Request)');

  // 3.6 Invalid Password (no uppercase) Rejection
  const noUpperRes = await request('POST', '/users', {
    name: `Valid Name For Testing ${rand}`,
    email: `bad.pwd.${rand}@example.com`,
    password: 'nouppercase123!',
    role: 'NORMAL_USER',
  }, adminToken);
  assert.strictEqual(noUpperRes.status, 400);
  console.log('   ✅ 3.6 Password without Uppercase Rejection (400 Bad Request)');

  // 3.7 Invalid Role Rejection
  const badRoleRes = await request('POST', '/users', {
    name: `Valid Name For Testing ${rand}`,
    email: `bad.role.${rand}@example.com`,
    password: 'Password123!',
    role: 'SUPER_HACKER',
  }, adminToken);
  assert.strictEqual(badRoleRes.status, 400);
  console.log('   ✅ 3.7 Invalid Role Clearance Rejection (400 Bad Request)');

  // 3.8 Admin Inspects User Details with Store-Owner Breakdown
  const inspectRes = await request('GET', '/users/2', null, adminToken);
  assert.strictEqual(inspectRes.status, 200);
  assert.ok(Array.isArray(inspectRes.body.data.owned_stores));
  console.log('   ✅ 3.8 User Details Inspection with Owner Store Breakdown (200 OK)');
}

module.exports = runUsersTests;
