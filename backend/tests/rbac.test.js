const assert = require('assert');
const { request } = require('./testHelper');

async function runRbacTests() {
  console.log('\n🔵 [TEST SUITE 2/6]: Role-Based Access Control (RBAC) & Role Hierarchy');

  // Obtain tokens for all 3 roles
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  const adminToken = adminLogin.body.data.token;

  const ownerLogin = await request('POST', '/auth/login', {
    email: 'owner.marcus@freshmart.com',
    password: 'OwnerPassword123!',
  });
  const ownerToken = ownerLogin.body.data.token;

  const userLogin = await request('POST', '/auth/login', {
    email: 'sarah.jenkins@example.com',
    password: 'UserPassword123!',
  });
  const userToken = userLogin.body.data.token;

  // 2.1 SYSTEM_ADMIN Authorized Access to Admin Dashboard
  const adminDashRes = await request('GET', '/dashboard/admin', null, adminToken);
  assert.strictEqual(adminDashRes.status, 200);
  assert.ok(adminDashRes.body.data.stats);
  console.log('   ✅ 2.1 SYSTEM_ADMIN Authorized: Platform Metrics Dashboard (200 OK)');

  // 2.2 NORMAL_USER Blocked from Admin Dashboard (403 Forbidden)
  const userAdminDashRes = await request('GET', '/dashboard/admin', null, userToken);
  assert.strictEqual(userAdminDashRes.status, 403, 'Normal user must receive 403 Forbidden');
  console.log('   ✅ 2.2 NORMAL_USER Blocked from Admin Dashboard (403 Forbidden)');

  // 2.3 NORMAL_USER Blocked from Admin User Directory (403 Forbidden)
  const userUsersRes = await request('GET', '/users', null, userToken);
  assert.strictEqual(userUsersRes.status, 403, 'Normal user must receive 403 Forbidden');
  console.log('   ✅ 2.3 NORMAL_USER Blocked from User Registry (403 Forbidden)');

  // 2.4 NORMAL_USER Blocked from Store Creation (403 Forbidden)
  const userStoreCreateRes = await request('POST', '/stores', {
    name: 'Unauthorized User Store 1234',
    email: 'unauth@example.com',
    address: '123 Fake Street',
  }, userToken);
  assert.strictEqual(userStoreCreateRes.status, 403, 'Normal user must receive 403 Forbidden on store creation');
  console.log('   ✅ 2.4 NORMAL_USER Blocked from Store Creation (403 Forbidden)');

  // 2.5 STORE_OWNER Blocked from Admin Dashboard (403 Forbidden)
  const ownerAdminDashRes = await request('GET', '/dashboard/admin', null, ownerToken);
  assert.strictEqual(ownerAdminDashRes.status, 403, 'Store owner must receive 403 Forbidden');
  console.log('   ✅ 2.5 STORE_OWNER Blocked from Admin Dashboard (403 Forbidden)');

  // 2.6 STORE_OWNER Inherits NORMAL_USER Capabilities (Can browse & submit ratings)
  const ownerBrowseRes = await request('GET', '/stores/browse', null, ownerToken);
  assert.strictEqual(ownerBrowseRes.status, 200, 'Store owner can access Normal User store browsing');
  console.log('   ✅ 2.6 STORE_OWNER Inherits NORMAL_USER Capabilities (200 OK)');

  // 2.7 SYSTEM_ADMIN Inherits All Capabilities (Can access Store Owner & Normal User APIs)
  const adminOwnerStatsRes = await request('GET', '/dashboard/owner/statistics?storeId=1', null, adminToken);
  assert.strictEqual(adminOwnerStatsRes.status, 200, 'Admin can inspect any store owner statistics');
  const adminBrowseRes = await request('GET', '/stores/browse', null, adminToken);
  assert.strictEqual(adminBrowseRes.status, 200, 'Admin can access store browsing');
  console.log('   ✅ 2.7 SYSTEM_ADMIN Inherits STORE_OWNER & NORMAL_USER Capabilities (200 OK)');

  // 2.8 Cross-Owner Isolation: Store Owner cannot query foreign store analytics
  const crossOwnerRes = await request('GET', '/dashboard/owner/statistics?storeId=2', null, ownerToken);
  assert.strictEqual(crossOwnerRes.status, 403, 'Owner cannot query another owner store');
  console.log('   ✅ 2.8 Cross-Owner Isolation: Blocked from Foreign Store Telemetry (403 Forbidden)');
}

module.exports = runRbacTests;
