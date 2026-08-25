const app = require('./app');
const envConfig = require('./config/env.config');
const { checkHealth, pool } = require('./database/connection');

const startServer = async () => {
  const server = app.listen(envConfig.port, async () => {
    console.log('====================================================');
    console.log(`🚀 Store Rating Enterprise Backend API Running!`);
    console.log(`📡 Environment: [${envConfig.env}]`);
    console.log(`📌 API Version: [/api/${envConfig.apiVersion}]`);
    console.log(`🔗 API Base URL: http://localhost:${envConfig.port}/api/${envConfig.apiVersion}`);
    console.log(`🩺 Health Check: http://localhost:${envConfig.port}/api/${envConfig.apiVersion}/health`);
    console.log('====================================================');

    // Test database connection gracefully
    try {
      const dbStatus = await checkHealth();
      if (dbStatus.connected) {
        console.log(`✅ PostgreSQL Connected: [${dbStatus.database}]`);
      } else {
        console.log(`ℹ️ PostgreSQL Status: ${dbStatus.message}`);
        console.log(`👉 Backend running in resilient mode. Database queries will connect once PostgreSQL is active.`);
      }
    } catch (err) {
      console.warn(`Database connection check warning: ${err.message}`);
    }
  });

  // Graceful Shutdown Logic
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      if (pool) {
        try {
          await pool.end();
          console.log('📦 PostgreSQL connection pool closed.');
        } catch (e) {
          console.error('Error closing PostgreSQL pool:', e.message);
        }
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('⚠️ Forcing immediate process termination after shutdown timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [Process Fatal] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('💥 [Process Fatal] Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
};

startServer();
