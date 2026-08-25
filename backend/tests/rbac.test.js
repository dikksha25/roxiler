const assert = require('assert');
const { request } = require('./testHelper');

async function runRbacTests() {
  console.log('\n🔵 [TEST SUITE 2/6]: Role-Based Access Control (RBAC) & Authorization');

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

  // 2.6 STORE_OWNER Blocked from Rating Submission (403 Forbidden)
  const ownerRateRes = await request('POST', '/ratings', {
    storeId: 1,
    rating: 5,
  }, ownerToken);
  assert.strictEqual(ownerRateRes.status, 403, 'Store owner must receive 403 Forbidden on rating submission');
  console.log('   ✅ 2.6 STORE_OWNER Blocked from Submitting Customer Ratings (403 Forbidden)');

  // 2.7 STORE_OWNER Authorized Access to Own Store Telemetry
  const ownerStatsRes = await request('GET', '/dashboard/owner/statistics', null, ownerToken);
  assert.strictEqual(ownerStatsRes.status, 200);
  assert.ok(ownerStatsRes.body.data.overall);
  console.log('   ✅ 2.7 STORE_OWNER Authorized: Own Store Telemetry (200 OK)');

  // 2.8 STORE_OWNER Blocked from Another Owner\'s Store Telemetry (403 Forbidden)
  const crossOwnerRes = await request('GET', '/dashboard/owner/statistics?storeId=2', null, ownerToken);
  assert.strictEqual(crossOwnerRes.status, 403, 'Owner cannot query another owner store');
  console.log('   ✅ 2.8 Cross-Owner Isolation: Blocked from Foreign Store Telemetry (403 Forbidden)');
}

module.exports = runRbacTests;
