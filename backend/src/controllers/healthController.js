const { testConnection, getStatus } = require('../config/db');
const config = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

/**
 * Healthcheck endpoint handler
 */
const getHealth = async (req, res) => {
  const dbStatus = await testConnection();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    service: 'store-rating-backend',
    version: '1.0.0',
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message,
      databaseName: dbStatus.database || config.db.database,
      serverTime: dbStatus.serverTime || null,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  return ApiResponse.success(res, 'Backend service is active and responsive', healthData);
};

module.exports = {
  getHealth,
};
