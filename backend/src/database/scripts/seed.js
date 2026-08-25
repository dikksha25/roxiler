const { pool, checkHealth, withTransaction } = require('../connection');
const { hashPassword } = require('../../utils/password.util');
const { ROLES } = require('../../constants/roles.constant');

const runSeed = async () => {
  console.log('====================================================');
  console.log('🌱 PostgreSQL Realistic Data Seeder');
  console.log('====================================================');

  const health = await checkHealth();
  if (!health.connected) {
    console.error('❌ Cannot connect to PostgreSQL server:', health.message);
    console.error('👉 Please verify PostgreSQL is running.');
    process.exit(1);
  }

  console.log(`✅ Target Database: [${health.database}]`);

  try {
    console.log('🔐 Generating bcrypt salted password hashes (rounds: 10)...');

    const adminHash = await hashPassword('AdminPassword123!');
    const ownerHash = await hashPassword('OwnerPassword123!');
    const userHash = await hashPassword('UserPassword123!');

    await withTransaction(async (client) => {
      // 1. Seed Users (1 Admin, 2 Store Owners, 4 Normal Users)
      console.log('👥 Seeding users across all 3 roles...');
      const usersData = [
        {
          id: 1,
          name: 'Alexander Wright',
          email: 'admin@storerating.com',
          password_hash: adminHash,
          address: '100 Innovation Way, Suite 500, Tech Metropolis',
          role: ROLES.SYSTEM_ADMIN,
        },
        {
          id: 2,
          name: 'Marcus Vance',
          email: 'owner.marcus@freshmart.com',
          password_hash: ownerHash,
          address: '452 Marketplace Blvd, Downtown Plaza',
          role: ROLES.STORE_OWNER,
        },
        {
          id: 3,
          name: 'Elena Rostova',
          email: 'owner.elena@nexuscoffee.com',
          password_hash: ownerHash,
          address: '88 Artisan Alley, Heritage Square',
          role: ROLES.STORE_OWNER,
        },
        {
          id: 4,
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@example.com',
          password_hash: userHash,
          address: '742 Evergreen Terrace, Sector 4',
          role: ROLES.NORMAL_USER,
        },
        {
          id: 5,
          name: 'David Kim',
          email: 'david.kim@example.com',
          password_hash: userHash,
          address: '12 Elm Street, Apt 3B',
          role: ROLES.NORMAL_USER,
        },
        {
          id: 6,
          name: 'Amara Okafor',
          email: 'amara.okafor@example.com',
          password_hash: userHash,
          address: '304 Pine View Crescent',
          role: ROLES.NORMAL_USER,
        },
        {
          id: 7,
          name: 'Lucas Mora',
          email: 'lucas.mora@example.com',
          password_hash: userHash,
          address: '55 Ocean Boulevard, Marina District',
          role: ROLES.NORMAL_USER,
        },
      ];

      for (const u of usersData) {
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, address, role)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             address = EXCLUDED.address,
             role = EXCLUDED.role,
             updated_at = CURRENT_TIMESTAMP`,
          [u.id, u.name, u.email, u.password_hash, u.address, u.role]
        );
      }

      await client.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
      console.log(`   ✓ Seeded ${usersData.length} users with secure bcrypt hashes.`);

      // 2. Seed Stores (Associated with Store Owners Marcus & Elena)
      console.log('🏪 Seeding stores owned by store owners...');
      const storesData = [
        {
          id: 1,
          name: 'FreshMart Supermarket & Organics',
          email: 'contact@freshmart.com',
          address: '452 Marketplace Blvd, Downtown Plaza',
          owner_id: 2,
        },
        {
          id: 2,
          name: 'Nexus Specialty Coffee & Bakery Lounge',
          email: 'hello@nexuscoffee.com',
          address: '88 Artisan Alley, Heritage Square',
          owner_id: 3,
        },
        {
          id: 3,
          name: 'Apex Electronics & Smart Devices',
          email: 'support@apexelectronics.com',
          address: '108 Silicon Avenue, Innovation District',
          owner_id: 2,
        },
      ];

      for (const s of storesData) {
        await client.query(
          `INSERT INTO stores (id, name, email, address, owner_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             address = EXCLUDED.address,
             owner_id = EXCLUDED.owner_id,
             updated_at = CURRENT_TIMESTAMP`,
          [s.id, s.name, s.email, s.address, s.owner_id]
        );
      }

      await client.query(`SELECT setval('stores_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stores))`);
      console.log(`   ✓ Seeded ${storesData.length} stores with owner associations.`);

      // 3. Seed Ratings (Submitted by NORMAL_USER accounts: Sarah, David, Amara, Lucas)
      console.log('⭐ Seeding 1-to-5 star customer ratings...');
      const ratingsData = [
        {
          id: 1,
          user_id: 4,
          store_id: 1,
          rating_value: 5,
          comment: 'Exceptional organic produce, vibrant displays, and courteous checkout staff. Highly recommended!',
        },
        {
          id: 2,
          user_id: 5,
          store_id: 1,
          rating_value: 4,
          comment: 'Very clean store with great dairy selections. Parking can get crowded on weekends.',
        },
        {
          id: 3,
          user_id: 6,
          store_id: 1,
          rating_value: 5,
          comment: 'Always fresh greens and artisan sourdough bread. My weekly grocery shopping destination.',
        },
        {
          id: 4,
          user_id: 7,
          store_id: 1,
          rating_value: 4,
          comment: 'Fast billing queues and fresh fruit shipments every Tuesday morning.',
        },
        {
          id: 5,
          user_id: 4,
          store_id: 2,
          rating_value: 5,
          comment: 'The single-origin Ethiopian pour-over is magnificent. Peaceful study environment and fast Wi-Fi.',
        },
        {
          id: 6,
          user_id: 5,
          store_id: 2,
          rating_value: 5,
          comment: 'Warm atmosphere, delicious almond croissants, and welcoming baristas.',
        },
        {
          id: 7,
          user_id: 6,
          store_id: 2,
          rating_value: 4,
          comment: 'Charming interior aesthetics and premium roasted coffee beans.',
        },
        {
          id: 8,
          user_id: 4,
          store_id: 3,
          rating_value: 5,
          comment: 'Helpful technicians diagnosed my laptop hardware issue in under 15 minutes. Great warranty support.',
        },
        {
          id: 9,
          user_id: 5,
          store_id: 3,
          rating_value: 4,
          comment: 'Wide selection of peripherals, smart home gadgets, and competitive pricing.',
        },
        {
          id: 10,
          user_id: 7,
          store_id: 3,
          rating_value: 4,
          comment: 'Clean showroom, well-organized inventory, and honest product guidance.',
        },
      ];

      for (const r of ratingsData) {
        await client.query(
          `INSERT INTO ratings (id, user_id, store_id, rating_value, comment)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, store_id) DO UPDATE SET
             rating_value = EXCLUDED.rating_value,
             comment = EXCLUDED.comment,
             updated_at = CURRENT_TIMESTAMP`,
          [r.id, r.user_id, r.store_id, r.rating_value, r.comment]
        );
      }

      await client.query(`SELECT setval('ratings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ratings))`);
      console.log(`   ✓ Seeded ${ratingsData.length} ratings across stores.`);
    });

    console.log('====================================================');
    console.log('🎉 Repeatable Seed Process Finished Successfully!');
    console.log('====================================================');
    console.log('📋 Test Credentials:');
    console.log('   • System Admin: admin@storerating.com | AdminPassword123!');
    console.log('   • Store Owner 1: owner.marcus@freshmart.com | OwnerPassword123!');
    console.log('   • Store Owner 2: owner.elena@nexuscoffee.com | OwnerPassword123!');
    console.log('   • Normal User 1: sarah.jenkins@example.com | UserPassword123!');
    console.log('   • Normal User 2: david.kim@example.com | UserPassword123!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Seeding Failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
