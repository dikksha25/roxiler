const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const user = await userService.createUser({ name, email, password, address, role });
  return ApiResponse.created(res, 'User created successfully by administrator', user);
});

const getUsers = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['name', 'email', 'address', 'role', 'created_at'],
    defaultSortBy: 'created_at',
  });

  // Extract explicit field filters
  parsedQuery.role = req.query.role || null;
  parsedQuery.name = req.query.name || '';
  parsedQuery.email = req.query.email || '';
  parsedQuery.address = req.query.address || '';

  const { users, pagination } = await userService.listUsers(parsedQuery);
  return ApiResponse.success(res, MESSAGES.USERS_RETRIEVED, { users }, 200, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await userService.getUserById(userId);
  return ApiResponse.success(res, 'User details retrieved successfully', user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  const user = await userService.updateProfile(req.user.id, { name, address });
  return ApiResponse.success(res, 'Profile updated successfully', user);
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
};
