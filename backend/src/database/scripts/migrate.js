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

  const migrationsDir = path.resolve(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const schemaSql = fs.readFileSync(filePath, 'utf-8');
      console.log(`📄 Executing: ${file}...`);

      await withTransaction(async (client) => {
        await client.query(schemaSql);
      });
    }

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
