const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, MESSAGES.REGISTER_SUCCESS, result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return ApiResponse.success(res, MESSAGES.LOGIN_SUCCESS, result);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return ApiResponse.success(res, 'Profile retrieved', user);
});

const logout = asyncHandler(async (req, res) => {
  const token = extractBearerToken(req);
  const result = await authService.logout(req.user?.id, token, req.user?.exp);
  return ApiResponse.success(res, MESSAGES.LOGOUT_SUCCESS, result);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = extractBearerToken(req);
  const result = await authService.updatePassword(
    req.user.id,
    { currentPassword, newPassword },
    token,
    req.user?.exp
  );
  return ApiResponse.success(res, MESSAGES.PASSWORD_UPDATED, result);
});

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  updatePassword,
};
