const ratingService = require('../services/rating.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const submitRating = asyncHandler(async (req, res) => {
  const { storeId, store_id, rating, ratingValue, comment } = req.body;
  const createdRating = await ratingService.submitRating(req.user.id, {
    storeId,
    store_id,
    rating,
    ratingValue,
    comment,
  });

  return ApiResponse.created(res, MESSAGES.RATING_SUBMITTED || 'Rating submitted successfully', createdRating);
});

const modifyRatingByStoreId = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { rating, ratingValue, comment } = req.body;

  const updated = await ratingService.modifyRatingByStoreId(req.user.id, storeId, {
    rating,
    ratingValue,
    comment,
  });

  return ApiResponse.success(res, MESSAGES.RATING_UPDATED || 'Rating updated successfully', updated);
});

const updateRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, ratingValue, comment } = req.body;
  const updated = await ratingService.updateRating(req.user.id, id, {
    rating,
    ratingValue,
    comment,
  });

  return ApiResponse.success(res, MESSAGES.RATING_UPDATED || 'Rating updated successfully', updated);
});

const getOwnerRatings = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: [
      'name',
      'user_name',
      'email',
      'user_email',
      'address',
      'user_address',
      'rating',
      'rating_value',
      'date',
      'created_at',
    ],
    defaultSortBy: 'created_at',
  });

  parsedQuery.storeId = req.query.storeId ? parseInt(req.query.storeId, 10) : null;
  parsedQuery.rating = req.query.rating ? parseInt(req.query.rating, 10) : null;
  parsedQuery.search = req.query.search || '';
  parsedQuery.name = req.query.name || '';
  parsedQuery.email = req.query.email || '';
  parsedQuery.address = req.query.address || '';

  const { ratings, pagination } = await ratingService.getOwnerRatings(req.user.id, parsedQuery);
  return ApiResponse.success(res, 'Store owner ratings retrieved successfully', { ratings }, 200, pagination);
});

const getMyRatings = asyncHandler(async (req, res) => {
  const ratings = await ratingService.getUserRatings(req.user.id);
  return ApiResponse.success(res, 'User ratings retrieved successfully', ratings);
});

const getStoreRatings = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const ratings = await ratingService.getStoreRatings(storeId);
  return ApiResponse.success(res, 'Store ratings retrieved successfully', ratings);
});

module.exports = {
  submitRating,
  modifyRatingByStoreId,
  updateRating,
  getOwnerRatings,
  getMyRatings,
  getStoreRatings,
};
