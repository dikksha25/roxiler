const app = require('./app');
const config = require('./config/env');
const { testConnection, pool } = require('./config/db');

const startServer = async () => {
  const server = app.listen(config.port, async () => {
    console.log('====================================================');
    console.log(`🌟 Store Rating API Server running!`);
    console.log(`📡 Environment: [${config.env}]`);
    console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
    console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
    console.log('====================================================');

    // Test database connection gracefully
    try {
      const dbTest = await testConnection();
      if (dbTest.connected) {
        console.log(`✅ Database Status: Connected to [${dbTest.database}]`);
      } else {
        console.log(`⚠️ Database Status: ${dbTest.message}`);
        console.log(`👉 Backend is running in resilient mode. Database operations will connect once PostgreSQL is active.`);
      }
    } catch (err) {
      console.log(`⚠️ Database connection attempt: ${err.message}`);
    }
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      if (pool) {
        try {
          await pool.end();
          console.log('📦 PostgreSQL pool disconnected.');
        } catch (e) {
          console.error('Error closing PostgreSQL pool:', e.message);
        }
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('⚠️ Forcing process shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
