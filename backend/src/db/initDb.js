const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../constants/roles');

/**
 * Initialize PostgreSQL schema and seed baseline administrative user
 */
const initializeDatabase = async () => {
  console.log('🚀 Starting PostgreSQL Database Initialization...');

  const conn = await testConnection();
  if (!conn.connected) {
    console.error('❌ Cannot connect to PostgreSQL:', conn.message);
    console.error('👉 Please make sure PostgreSQL service is running and credentials in .env are correct.');
    process.exit(1);
  }

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('📄 Executing schema.sql migrations...');
    await pool.query(schemaSql);
    console.log('✅ Tables, types, triggers, and indexes created successfully.');

    // Seed default admin if not existing
    const adminEmail = 'admin@storerating.com';
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      const defaultPassword = 'AdminPassword123!';
      const hashedPassword = await hashPassword(defaultPassword);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'System Administrator',
          adminEmail,
          hashedPassword,
          '100 Innovation Way, Suite 500, Tech City',
          ROLES.SYSTEM_ADMIN,
        ]
      );
      console.log(`✨ Default Admin user created: [${adminEmail}]`);
    } else {
      console.log(`ℹ️ Admin user [${adminEmail}] already exists.`);
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
