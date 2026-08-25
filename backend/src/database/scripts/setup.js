const runMigration = require('./migrate');
const runSeed = require('./seed');

const setupDatabase = async () => {
  console.log('🚀 Running Database Setup (Migration + Seed)...');
  await runMigration();
  await runSeed();
  console.log('✅ Database setup complete!');
};

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
