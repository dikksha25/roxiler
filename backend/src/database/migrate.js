const fs = require('fs');
const path = require('path');
const { pool, checkHealth } = require('./connection');
const { hashPassword } = require('../utils/password.util');

/**
 * Execute schema migrations and seed initial data
 */
const runMigrations = async () => {
  console.log('====================================================');
  console.log('🐘 Starting PostgreSQL Database Migration & Setup...');
  console.log('====================================================');

  const health = await checkHealth();
  if (!health.connected) {
    console.error('❌ Cannot connect to PostgreSQL server:', health.message);
    console.error('👉 Please verify PostgreSQL service is running and credentials in .env are correct.');
    process.exit(1);
  }

  console.log(`✅ Connected to database: [${health.database}]`);

  try {
    // 1. Execute All Schema Migrations in Sorted Sequence
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`📄 Executing migration file: ${file}...`);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      await pool.query(sqlContent);
      console.log(`✅ Migration ${file} applied successfully.`);
    }

    // 2. Hash real passwords and execute Seed Data
    console.log('🌱 Seeding initial platform data (Admin, Owners, Users, Stores, Ratings)...');

    const defaultAdminHash = await hashPassword('AdminPassword123!');
    const defaultOwnerHash = await hashPassword('OwnerPassword123!');
    const defaultUserHash = await hashPassword('UserPassword123!');

    // Insert users with hashed passwords
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, address, role)
      VALUES
        (1, 'System Administrator', 'admin@storerating.com', $1, '100 Innovation Way, Suite 500, Tech Metropolis', 'SYSTEM_ADMIN'),
        (2, 'Marcus Vance', 'owner1@freshmart.com', $2, '452 Marketplace Blvd, Downtown Plaza', 'STORE_OWNER'),
        (3, 'Elena Rostova', 'owner2@nexuscoffee.com', $2, '88 Artisan Alley, Heritage Square', 'STORE_OWNER'),
        (4, 'Sarah Jenkins', 'user1@example.com', $3, '742 Evergreen Terrace, Sector 4', 'NORMAL_USER'),
        (5, 'David Kim', 'user2@example.com', $3, '12 Elm Street, Apt 3B', 'NORMAL_USER'),
        (6, 'Amara Okafor', 'user3@example.com', $3, '304 Pine View Crescent', 'NORMAL_USER')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        role = EXCLUDED.role;
    `, [defaultAdminHash, defaultOwnerHash, defaultUserHash]);

    await pool.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);

    // Insert stores
    await pool.query(`
      INSERT INTO stores (id, name, email, address, owner_id)
      VALUES
        (1, 'FreshMart Supermarket & Organics', 'contact@freshmart.com', '452 Marketplace Blvd, Downtown Plaza', 2),
        (2, 'Nexus Specialty Coffee & Bakery', 'hello@nexuscoffee.com', '88 Artisan Alley, Heritage Square', 3),
        (3, 'Apex Electronics & Smart Devices', 'support@apexelectronics.com', '108 Silicon Avenue, Innovation District', 2)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        owner_id = EXCLUDED.owner_id;
    `);

    await pool.query(`SELECT setval('stores_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stores))`);

    // Insert ratings with sample owner replies
    await pool.query(`
      INSERT INTO ratings (id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at)
      VALUES
        (1, 4, 1, 5, 'Exceptional produce quality and friendly customer service! Clean aisles and fast checkout.', 'Thank you so much Sarah! Our team works diligently to stock farm-fresh organics daily.', NOW() - INTERVAL '1 day'),
        (2, 5, 1, 4, 'Great organic selection. Prices are reasonable and parking was easy.', 'Thanks for visiting David! We are currently expanding our weekend parking spots.', NOW() - INTERVAL '12 hours'),
        (3, 6, 1, 5, 'Always fresh veggies and wonderful bakery section. My go-to store!', NULL, NULL),
        (4, 4, 2, 5, 'The pour-over Ethiopian roast is outstanding. Quiet workspace atmosphere with fast wifi.', 'Appreciate the kind words! Glad you enjoyed our single-origin roast.', NOW() - INTERVAL '2 days'),
        (5, 5, 2, 5, 'Best croissants in the city and warm hospitality.', NULL, NULL),
        (6, 6, 3, 4, 'Knowledgeable technicians helped me configure my laptop within 30 minutes.', NULL, NULL)
      ON CONFLICT (user_id, store_id) DO UPDATE SET
        rating_value = EXCLUDED.rating_value,
        comment = EXCLUDED.comment,
        owner_reply = EXCLUDED.owner_reply,
        owner_replied_at = EXCLUDED.owner_replied_at,
        updated_at = CURRENT_TIMESTAMP;
    `);

    await pool.query(`SELECT setval('ratings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ratings))`);

    console.log('====================================================');
    console.log('🎉 PostgreSQL Database Migration & Seeding Complete!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
