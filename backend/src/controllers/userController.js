const UserModel = require('../models/userModel');
const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * List all users (System Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search = '', limit = 50, offset = 0 } = req.query;
    const users = await UserModel.findAll({
      role,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    const total = await UserModel.count();
    return ApiResponse.success(res, 'Users retrieved successfully', { users, total });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform-wide overview statistics (System Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      UserModel.count(),
      StoreModel.count(),
      RatingModel.count(),
    ]);

    return ApiResponse.success(res, 'Platform statistics retrieved', {
      totalUsers,
      totalStores,
      totalRatings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getPlatformStats,
};
