const assert = require('assert');
const { request } = require('./testHelper');

async function runPasswordTests() {
  console.log('\n🔵 [TEST SUITE 6/6]: Password Updates & Security');

  const rand = Math.floor(1000 + Math.random() * 9000);
  const email = `pass.user.${rand}@example.com`;

  // 1. Register a fresh user
  const regRes = await request('POST', '/auth/register', {
    name: `Password Tester Account ${rand}`,
    email,
    password: 'InitPass123!',
  });
  assert.strictEqual(regRes.status, 201);
  const token = regRes.body.data.token;

  // 6.1 Identical New Password Rejection
  const identicalRes = await request('PATCH', '/auth/update-password', {
    currentPassword: 'InitPass123!',
    newPassword: 'InitPass123!',
    confirmPassword: 'InitPass123!',
  }, token);
  assert.strictEqual(identicalRes.status, 400);
  console.log('   ✅ 6.1 Identical New Password Rejection (400 Bad Request)');

  // 6.2 Incorrect Current Password Rejection
  const wrongCurrentRes = await request('PATCH', '/auth/update-password', {
    currentPassword: 'WrongPassword123!',
    newPassword: 'NewSecurePass99!',
    confirmPassword: 'NewSecurePass99!',
  }, token);
  assert.strictEqual(wrongCurrentRes.status, 400);
  console.log('   ✅ 6.2 Incorrect Current Password Rejection (400 Bad Request)');

  // 6.3 Non-matching Confirmation Rejection
  const nonMatchRes = await request('PATCH', '/auth/update-password', {
    currentPassword: 'InitPass123!',
    newPassword: 'NewSecurePass99!',
    confirmPassword: 'DifferentPass123!',
  }, token);
  assert.strictEqual(nonMatchRes.status, 400);
  console.log('   ✅ 6.3 Non-matching Confirmation Rejection (400 Bad Request)');

  // 6.4 Successful Password Update
  const updateRes = await request('PATCH', '/auth/update-password', {
    currentPassword: 'InitPass123!',
    newPassword: 'NewSecurePass99!',
    confirmPassword: 'NewSecurePass99!',
  }, token);
  assert.strictEqual(updateRes.status, 200);
  console.log('   ✅ 6.4 Successful Password Update with Bcrypt (200 OK)');

  // 6.5 Old Password Cannot Be Used (401 Unauthorized)
  const oldLoginRes = await request('POST', '/auth/login', {
    email,
    password: 'InitPass123!',
  });
  assert.strictEqual(oldLoginRes.status, 401, 'Old password must be rejected');
  console.log('   ✅ 6.5 Old Password Invalidation Confirmed (401 Unauthorized)');

  // 6.6 New Password Login Succeeds
  const newLoginRes = await request('POST', '/auth/login', {
    email,
    password: 'NewSecurePass99!',
  });
  assert.strictEqual(newLoginRes.status, 200, 'New password login should succeed');
  assert.ok(newLoginRes.body.data.token);
  console.log('   ✅ 6.6 New Password Login Succeeds (200 OK)');
}

module.exports = runPasswordTests;
