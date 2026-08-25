const { checkHealth } = require('../database/connection');
const envConfig = require('../config/env.config');

class HealthService {
  /**
   * Get server, database, and system runtime health
   */
  async getHealthStatus() {
    const dbStatus = await checkHealth();

    return {
      status: 'healthy',
      service: 'store-rating-backend',
      version: '1.0.0',
      apiVersion: envConfig.apiVersion,
      environment: envConfig.env,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.connected,
        message: dbStatus.message,
        databaseName: dbStatus.database || envConfig.db.database,
        serverTime: dbStatus.serverTime || null,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    };
  }
}

module.exports = new HealthService();
