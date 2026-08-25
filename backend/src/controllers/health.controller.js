const healthService = require('../services/health.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { checkHealth } = require('../database/connection');

const getHealth = asyncHandler(async (req, res) => {
  const health = await healthService.getHealthStatus();
  return ApiResponse.success(res, 'Backend service is active and responsive', health);
});

const getLiveness = asyncHandler(async (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'store-rating-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

const getReadiness = asyncHandler(async (req, res) => {
  const dbHealth = await checkHealth();
  if (dbHealth.connected) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(503).json({
    status: 'not_ready',
    database: 'disconnected',
    message: dbHealth.message,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
};

