const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.user);
  return ApiResponse.success(res, 'Dashboard metrics retrieved', data);
});

module.exports = {
  getDashboard,
};
