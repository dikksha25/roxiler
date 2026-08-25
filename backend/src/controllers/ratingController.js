const RatingModel = require('../models/ratingModel');
const StoreModel = require('../models/storeModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * Submit or modify rating for a store (Normal User)
 */
const submitRating = async (req, res, next) => {
  try {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check store existence
    const store = await StoreModel.findById(storeId);
    if (!store) {
      return ApiResponse.notFound(res, 'Target store does not exist');
    }

    const savedRating = await RatingModel.upsert({
      userId,
      storeId: parseInt(storeId, 10),
      rating: parseInt(rating, 10),
      comment,
    });

    return ApiResponse.success(res, 'Rating submitted successfully', savedRating);
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a specific store
 */
const getStoreRatings = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const ratings = await RatingModel.findByStoreId(storeId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return ApiResponse.success(res, 'Store ratings retrieved successfully', ratings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's rating for a specific store
 */
const getMyRatingForStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const myRating = await RatingModel.findByUserAndStore(userId, storeId);
    return ApiResponse.success(res, 'User rating retrieved', myRating);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  getStoreRatings,
  getMyRatingForStore,
};
