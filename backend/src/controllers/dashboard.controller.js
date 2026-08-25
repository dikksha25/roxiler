const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.user);
  return ApiResponse.success(res, 'Dashboard metrics retrieved successfully', data);
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminMetrics();
  return ApiResponse.success(res, 'System Admin platform metrics retrieved successfully', data);
});

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStoreOwnerMetrics(req.user.id);
  return ApiResponse.success(res, 'Store Owner dashboard metrics retrieved successfully', data);
});

const getUserDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getNormalUserMetrics(req.user.id);
  return ApiResponse.success(res, 'Normal User activity metrics retrieved successfully', data);
});

module.exports = {
  getDashboard,
  getAdminDashboard,
  getOwnerDashboard,
  getUserDashboard,
};
