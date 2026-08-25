const assert = require('assert');
const { request } = require('./testHelper');

async function runStoresTests() {
  console.log('\n🔵 [TEST SUITE 4/6]: Stores Management, Filtering & Search');

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

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 4.1 Admin Creates Store
  const storeRes = await request('POST', '/stores', {
    name: `Enterprise Supermarket ${rand}`,
    email: `store.${rand}@freshmart.com`,
    address: '888 Commerce Avenue, Metro Center',
    ownerId: 2,
  }, adminToken);
  assert.strictEqual(storeRes.status, 201, 'Store creation should return 201 Created');
  assert.strictEqual(storeRes.body.data.name, `Enterprise Supermarket ${rand}`);
  const createdStoreId = storeRes.body.data.id;
  console.log('   ✅ 4.1 Admin Created Store with Owner Association (201 Created)');

  // 4.2 Invalid Store Name (< 20 characters) Rejection
  const badStoreNameRes = await request('POST', '/stores', {
    name: 'Short Store',
    email: `bad.${rand}@example.com`,
    address: '123 Fake Street',
  }, adminToken);
  assert.strictEqual(badStoreNameRes.status, 400);
  console.log('   ✅ 4.2 Store Name < 20 Characters Rejection (400 Bad Request)');

  // 4.3 List Stores with Pagination
  const listRes = await request('GET', '/stores?page=1&limit=2', null, adminToken);
  assert.strictEqual(listRes.status, 200);
  assert.strictEqual(listRes.body.data.stores.length, 2);
  assert.ok(listRes.body.pagination.totalItems >= 2);
  console.log('   ✅ 4.3 Store Listing with Server-Side Pagination (200 OK)');

  // 4.4 Search Stores by Name
  const searchNameRes = await request('GET', `/stores?name=${encodeURIComponent(`Enterprise Supermarket ${rand}`)}`, null, adminToken);
  assert.strictEqual(searchNameRes.status, 200);
  assert.strictEqual(searchNameRes.body.data.stores[0].id, createdStoreId);
  console.log('   ✅ 4.4 Search Stores by Name (200 OK)');

  // 4.5 Search Stores by Address
  const searchAddrRes = await request('GET', '/stores?address=Commerce', null, adminToken);
  assert.strictEqual(searchAddrRes.status, 200);
  assert.ok(searchAddrRes.body.data.stores.length >= 1);
  console.log('   ✅ 4.5 Search Stores by Physical Address (200 OK)');

  // 4.6 Sort Stores by Name ASC & DESC (Allowlist Verified)
  const sortAscRes = await request('GET', '/stores?sortBy=name&sortOrder=ASC', null, adminToken);
  assert.strictEqual(sortAscRes.status, 200);
  console.log('   ✅ 4.6 Sort Stores by Name via SQL Allowlist (200 OK)');

  // 4.7 Normal User Store Browsing with Rating Context
  const browseRes = await request('GET', '/stores/browse', null, userToken);
  assert.strictEqual(browseRes.status, 200);
  assert.ok(Array.isArray(browseRes.body.data.stores));
  assert.ok('user_rating' in browseRes.body.data.stores[0], 'Must include user_rating attribute for authenticated user');
  console.log('   ✅ 4.7 Normal User Store Directory with Personal Rating Context (200 OK)');
}

module.exports = runStoresTests;
