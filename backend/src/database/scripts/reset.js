const { pool, checkHealth, withTransaction } = require('../connection');
const runMigration = require('./migrate');
const runSeed = require('./seed');

const resetDatabase = async () => {
  console.log('====================================================');
  console.log('⚠️  DEVELOPMENT DATABASE RESET');
  console.log('====================================================');

  const health = await checkHealth();
  if (!health.connected) {
    console.error('❌ Cannot connect to PostgreSQL server:', health.message);
    process.exit(1);
  }

  console.log(`⚠️  Dropping all views, triggers, and tables in [${health.database}]...`);

  try {
    await withTransaction(async (client) => {
      await client.query(`
        DROP VIEW IF EXISTS v_store_rating_summaries CASCADE;
        DROP TABLE IF EXISTS ratings CASCADE;
        DROP TABLE IF EXISTS stores CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TYPE IF EXISTS user_role CASCADE;
      `);
    });

    console.log('🧹 Cleaned all existing schema objects.');
    console.log('🔄 Re-running migrations and seed...');

    await pool.end();

    // Run migration
    await runMigration();
    // Run seed
    await runSeed();

    console.log('====================================================');
    console.log('✅ Database reset completed successfully!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
