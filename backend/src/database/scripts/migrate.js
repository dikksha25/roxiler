const fs = require('fs');
const path = require('path');
const { pool, checkHealth, withTransaction } = require('../connection');

const runMigration = async () => {
  console.log('====================================================');
  console.log('🐘 PostgreSQL Schema Migration Runner');
  console.log('====================================================');

  const health = await checkHealth();
  if (!health.connected) {
    console.error('❌ Cannot connect to PostgreSQL server:', health.message);
    console.error('👉 Please ensure PostgreSQL service is active and credentials in .env are correct.');
    process.exit(1);
  }

  console.log(`✅ Target Database: [${health.database}]`);

  const schemaFile = path.resolve(__dirname, '../migrations/001_initial_schema.sql');
  if (!fs.existsSync(schemaFile)) {
    console.error(`❌ Migration schema file not found at: ${schemaFile}`);
    process.exit(1);
  }

  try {
    const schemaSql = fs.readFileSync(schemaFile, 'utf-8');
    console.log(`📄 Executing: ${path.basename(schemaFile)}...`);

    await withTransaction(async (client) => {
      await client.query(schemaSql);
    });

    // Verify created tables
    const res = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('✅ Tables verified in database:');
    res.rows.forEach((r) => console.log(`   • ${r.table_name}`));

    console.log('✨ Schema migration completed successfully!');
  } catch (error) {
    console.error('❌ Schema Migration Failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
