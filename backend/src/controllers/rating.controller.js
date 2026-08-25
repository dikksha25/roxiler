const ratingService = require('../services/rating.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const submitRating = asyncHandler(async (req, res) => {
  const { storeId, rating, rating_value, comment } = req.body;
  const savedRating = await ratingService.submitRating({
    userId: req.user.id,
    storeId,
    rating,
    rating_value,
    comment,
  });

  return ApiResponse.success(res, MESSAGES.RATING_SUBMITTED, savedRating);
});

const getStoreRatings = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['rating', 'rating_value', 'created_at'],
    defaultSortBy: 'created_at',
  });

  const { ratings, pagination } = await ratingService.listStoreRatings(storeId, parsedQuery);
  return ApiResponse.success(res, MESSAGES.RATINGS_RETRIEVED, { ratings }, 200, pagination);
});

const getMyRatingForStore = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const myRating = await ratingService.getUserRatingForStore(req.user.id, storeId);
  return ApiResponse.success(res, 'User rating retrieved', myRating);
});

const getMyRatings = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query);
  const { ratings, pagination } = await ratingService.listUserRatings(req.user.id, parsedQuery);
  return ApiResponse.success(res, 'User submitted ratings retrieved', { ratings }, 200, pagination);
});

module.exports = {
  submitRating,
  getStoreRatings,
  getMyRatingForStore,
  getMyRatings,
};
