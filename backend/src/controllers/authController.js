const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Handle user registration
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const result = await AuthService.register({ name, email, password, address, role });
    return ApiResponse.created(res, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    return ApiResponse.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user.id);
    return ApiResponse.success(res, 'User profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
