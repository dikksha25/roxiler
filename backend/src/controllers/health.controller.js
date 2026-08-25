const healthService = require('../services/health.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getHealth = asyncHandler(async (req, res) => {
  const health = await healthService.getHealthStatus();
  return ApiResponse.success(res, 'Backend service is active and responsive', health);
});

module.exports = {
  getHealth,
};
