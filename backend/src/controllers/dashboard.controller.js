const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { ROLES } = require('../constants/roles.constant');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.user);
  return ApiResponse.success(res, 'Dashboard metrics retrieved', data);
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData({ ...req.user, role: ROLES.SYSTEM_ADMIN });
  return ApiResponse.success(res, 'System Admin Dashboard overview', data);
});

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData({ ...req.user, role: ROLES.STORE_OWNER });
  return ApiResponse.success(res, 'Store Owner Dashboard overview', data);
});

const getUserDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData({ ...req.user, role: ROLES.NORMAL_USER });
  return ApiResponse.success(res, 'Normal User Dashboard overview', data);
});

module.exports = {
  getDashboard,
  getAdminDashboard,
  getOwnerDashboard,
  getUserDashboard,
};
