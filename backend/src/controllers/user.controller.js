const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const listUsers = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['name', 'email', 'role', 'created_at'],
    defaultSortBy: 'created_at',
  });

  const { users, pagination } = await userService.listUsers({
    ...parsedQuery,
    role: req.query.role || null,
  });

  return ApiResponse.success(res, MESSAGES.USERS_RETRIEVED, { users }, 200, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, 'User retrieved', user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, MESSAGES.USER_UPDATED, updated);
});

module.exports = {
  listUsers,
  getUserById,
  updateProfile,
};
