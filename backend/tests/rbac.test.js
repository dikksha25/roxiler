const assert = require('assert');
const { request } = require('./testHelper');

async function runRbacTests() {
  console.log('\n🔵 [TEST SUITE 2/6]: Role-Based Access Control (RBAC), Privilege Escalation & IDOR/BOLA Protection');

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
  console.log('   ✅ 2.2 Vertical Privilege Escalation Blocked: Normal User -> Admin Dashboard (403 Forbidden)');

  // 2.3 NORMAL_USER Blocked from Admin User Directory (403 Forbidden)
  const userUsersRes = await request('GET', '/users', null, userToken);
  assert.strictEqual(userUsersRes.status, 403, 'Normal user must receive 403 Forbidden');
  console.log('   ✅ 2.3 Vertical Privilege Escalation Blocked: Normal User -> User Registry (403 Forbidden)');

  // 2.4 NORMAL_USER Blocked from Store Creation (403 Forbidden)
  const userStoreCreateRes = await request('POST', '/stores', {
    name: 'Unauthorized User Store 1234',
    email: 'unauth@example.com',
    address: '123 Fake Street',
  }, userToken);
  assert.strictEqual(userStoreCreateRes.status, 403, 'Normal user must receive 403 Forbidden on store creation');
  console.log('   ✅ 2.4 Vertical Privilege Escalation Blocked: Normal User -> Store Creation (403 Forbidden)');

  // 2.5 STORE_OWNER Blocked from Admin Dashboard (403 Forbidden)
  const ownerAdminDashRes = await request('GET', '/dashboard/admin', null, ownerToken);
  assert.strictEqual(ownerAdminDashRes.status, 403, 'Store owner must receive 403 Forbidden');
  console.log('   ✅ 2.5 Vertical Privilege Escalation Blocked: Store Owner -> Admin Dashboard (403 Forbidden)');

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

  // 2.8 Horizontal Isolation (BOLA): Store Owner cannot query foreign store analytics
  const crossOwnerRes = await request('GET', '/dashboard/owner/statistics?storeId=2', null, ownerToken);
  assert.strictEqual(crossOwnerRes.status, 403, 'Owner cannot query another owner store');
  console.log('   ✅ 2.8 Horizontal Isolation (BOLA): Blocked from Foreign Store Telemetry (403 Forbidden)');

  // 2.9 Horizontal Isolation (BOLA): Store Owner cannot inspect foreign store ratings by ID
  const crossStoreRatingsRes = await request('GET', '/ratings/store/2', null, ownerToken);
  assert.strictEqual(crossStoreRatingsRes.status, 403, 'Owner cannot query ratings for a foreign store');
  console.log('   ✅ 2.9 Horizontal Isolation (BOLA): Blocked from Foreign Store Ratings Feed (403 Forbidden)');

  // 2.10 Horizontal Isolation (BOLA): Store Owner cannot filter foreign store reviews
  const crossStoreOwnerRatingsRes = await request('GET', '/ratings/owner-ratings?storeId=2', null, ownerToken);
  assert.strictEqual(crossStoreOwnerRatingsRes.status, 403, 'Owner cannot filter foreign store reviews');
  console.log('   ✅ 2.10 Horizontal Isolation (BOLA): Blocked from Filtering Foreign Store Reviews (403 Forbidden)');

  // 2.11 IDOR on User Profiles: Normal user blocked from accessing /users/:id
  const userInspectRes = await request('GET', '/users/1', null, userToken);
  assert.strictEqual(userInspectRes.status, 403, 'Normal user cannot inspect specific user profile via /users/:id');
  console.log('   ✅ 2.11 IDOR Prevention on User Profiles: Normal user blocked from /users/:id (403 Forbidden)');

  // 2.12 Privilege Escalation Blocked in Self-Registration
  const regEscalationRes = await request('POST', '/auth/register', {
    name: 'Privilege Escalation Tester',
    email: `escalate_${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'SYSTEM_ADMIN', // Attempted escalation
  });
  assert.strictEqual(regEscalationRes.status, 201);
  assert.strictEqual(regEscalationRes.body.data.user.role, 'NORMAL_USER', 'Must enforce NORMAL_USER role on registration');
  console.log('   ✅ 2.12 Privilege Escalation Blocked: Role tampering on self-registration strictly forced to NORMAL_USER');
}

module.exports = runRbacTests;
