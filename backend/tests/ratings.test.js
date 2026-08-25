const assert = require('assert');
const { request } = require('./testHelper');

async function runRatingsTests() {
  console.log('\n🔵 [TEST SUITE 5/6]: Store Ratings & Review Feedback');

  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@storerating.com',
    password: 'AdminPassword123!',
  });
  const adminToken = adminLogin.body.data.token;

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 1. Create a fresh store
  const storeRes = await request('POST', '/stores', {
    name: `Fresh Bakery Rating Test ${rand}`,
    email: `bakery.${rand}@example.com`,
    address: '99 Flour Mill Lane',
    ownerId: 2,
  }, adminToken);
  const storeId = storeRes.body.data.id;

  // 2. Register 2 distinct consumers
  const user1Res = await request('POST', '/auth/register', {
    name: `Reviewer Alice Sterling ${rand}`,
    email: `alice.${rand}@example.com`,
    password: 'UserPassword123!',
  });
  const token1 = user1Res.body.data.token;

  const user2Res = await request('POST', '/auth/register', {
    name: `Reviewer Bob Thornton ${rand}`,
    email: `bob.${rand}@example.com`,
    password: 'UserPassword123!',
  });
  const token2 = user2Res.body.data.token;

  // 5.1 Store initially has zero ratings
  const initialStore = await request('GET', `/stores/${storeId}`, null, adminToken);
  assert.strictEqual(Number(initialStore.body.data.overall_rating || initialStore.body.data.average_rating || 0), 0);
  console.log('   ✅ 5.1 Unrated Store State: Gracefully handles 0 ratings (0.00 ★)');

  // 5.2 Submit Rating Below 1 (0) Rejection
  const lowRatingRes = await request('POST', '/ratings', {
    storeId,
    rating: 0,
  }, token1);
  assert.strictEqual(lowRatingRes.status, 400);
  console.log('   ✅ 5.2 Rating Value Below 1 (0) Rejection (400 Bad Request)');

  // 5.3 Submit Rating Above 5 (6) Rejection
  const highRatingRes = await request('POST', '/ratings', {
    storeId,
    rating: 6,
  }, token1);
  assert.strictEqual(highRatingRes.status, 400);
  console.log('   ✅ 5.3 Rating Value Above 5 (6) Rejection (400 Bad Request)');

  // 5.4 Submit Valid Rating (User 1 gives 5 ★)
  const submit1Res = await request('POST', '/ratings', {
    storeId,
    rating: 5,
    comment: 'Exceptional artisan pastries and warm service!',
  }, token1);
  assert.strictEqual(submit1Res.status, 201);
  assert.strictEqual(submit1Res.body.data.rating_value, 5);
  console.log('   ✅ 5.4 Submit Valid Rating: 5 ★ (201 Created)');

  // 5.5 Duplicate Rating Rejected (409 Conflict)
  const dupRatingRes = await request('POST', '/ratings', {
    storeId,
    rating: 4,
  }, token1);
  assert.strictEqual(dupRatingRes.status, 409, 'Duplicate rating must return 409 Conflict');
  console.log('   ✅ 5.5 Duplicate Rating Rejection: 1 Rating Per User (409 Conflict)');

  // 5.6 Submit Valid Rating (User 2 gives 3 ★)
  const submit2Res = await request('POST', '/ratings', {
    storeId,
    rating: 3,
    comment: 'Average coffee, nice seating.',
  }, token2);
  assert.strictEqual(submit2Res.status, 201);
  assert.strictEqual(submit2Res.body.data.rating_value, 3);
  console.log('   ✅ 5.6 Second User Submits Rating: 3 ★ (201 Created)');

  // 5.7 Verify Arithmetic Mean Calculation: (5 + 3) / 2 = 4.00 ★
  const after2Ratings = await request('GET', `/stores/${storeId}`, null, adminToken);
  const avgAfter2 = Number(after2Ratings.body.data.overall_rating || after2Ratings.body.data.average_rating);
  assert.strictEqual(avgAfter2, 4);
  console.log('   ✅ 5.7 Arithmetic Average Calculation: (5 + 3) / 2 = 4.00 ★');

  // 5.8 Modify Existing Rating (User 2 changes 3 ★ -> 5 ★)
  const modifyRes = await request('PUT', `/ratings/${storeId}`, {
    rating: 5,
    comment: 'Updated review: Greatly improved beverage quality!',
  }, token2);
  assert.strictEqual(modifyRes.status, 200);
  assert.strictEqual(modifyRes.body.data.rating_value, 5);
  console.log('   ✅ 5.8 Modify Existing Rating: Changed 3 ★ -> 5 ★ (200 OK)');

  // 5.9 Verify Updated Arithmetic Mean: (5 + 5) / 2 = 5.00 ★
  const afterMod = await request('GET', `/stores/${storeId}`, null, adminToken);
  const avgAfterMod = Number(afterMod.body.data.overall_rating || afterMod.body.data.average_rating);
  assert.strictEqual(avgAfterMod, 5);
  console.log('   ✅ 5.9 Store Average Recalculated: (5 + 5) / 2 = 5.00 ★');
}

module.exports = runRatingsTests;
