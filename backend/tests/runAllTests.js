process.env.NODE_ENV = 'test';

const { startTestServer, stopTestServer } = require('./testHelper');
const runAuthTests = require('./auth.test');
const runRbacTests = require('./rbac.test');
const runUsersTests = require('./users.test');
const runStoresTests = require('./stores.test');
const runRatingsTests = require('./ratings.test');
const runPasswordTests = require('./password.test');
const runSecurityTests = require('./security.test');
const runRedTeamTests = require('./redteam.test');

async function main() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ENTERPRISE BACKEND TEST SUITE');
  console.log('================================================================');

  const startTime = Date.now();

  try {
    await startTestServer();

    await runAuthTests();
    await runRbacTests();
    await runUsersTests();
    await runStoresTests();
    await runRatingsTests();
    await runPasswordTests();
    await runSecurityTests();
    await runRedTeamTests();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log(`🎉 ALL 8 TEST SUITES PASSED (Duration: ${duration}s)`);
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:');
    console.error(err);
    process.exit(1);
  } finally {
    await stopTestServer();
  }
}

main();
