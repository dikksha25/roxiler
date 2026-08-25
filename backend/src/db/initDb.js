const runMigrations = require('../database/migrate');

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
