const { body, param, query } = require('express-validator');

const createRatingValidator = [
  body()
    .custom((value, { req }) => {
      const storeId = req.body.storeId || req.body.store_id;
      if (!storeId || isNaN(parseInt(storeId, 10)) || parseInt(storeId, 10) < 1) {
        throw new Error('Valid store ID is required');
      }

      const rating = req.body.rating !== undefined ? req.body.rating : req.body.ratingValue;
      if (rating === undefined || rating === null) {
        throw new Error('Rating value is required');
      }

      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new Error('Rating must be an integer between 1 and 5');
      }

      return true;
    }),

  body('comment')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

const updateRatingByStoreIdValidator = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID parameter is required'),

  body()
    .custom((value, { req }) => {
      const rating = req.body.rating !== undefined ? req.body.rating : req.body.ratingValue;
      if (rating === undefined || rating === null) {
        throw new Error('Rating value is required');
      }

      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new Error('Rating must be an integer between 1 and 5');
      }

      return true;
    }),

  body('comment')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

const updateRatingValidator = [
  body()
    .custom((value, { req }) => {
      const rating = req.body.rating !== undefined ? req.body.rating : req.body.ratingValue;
      if (rating !== undefined && rating !== null) {
        const ratingNum = parseInt(rating, 10);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          throw new Error('Rating must be an integer between 1 and 5');
        }
      }
      return true;
    }),

  body('comment')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

const listOwnerRatingsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn([
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
    ])
    .withMessage('sortBy must be a valid allowed field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),

  query('storeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('storeId must be a positive integer'),

  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('rating filter must be between 1 and 5'),

  query('search').optional().trim(),
  query('name').optional().trim(),
  query('email').optional().trim(),
  query('address').optional().trim(),
];

const replyToRatingValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid rating ID is required'),

  body()
    .custom((value, { req }) => {
      const replyText = req.body.reply || req.body.comment;
      if (!replyText || !replyText.trim()) {
        throw new Error('Reply message cannot be empty');
      }
      if (replyText.trim().length > 500) {
        throw new Error('Reply message cannot exceed 500 characters');
      }
      return true;
    }),
];

module.exports = {
  createRatingValidator,
  updateRatingByStoreIdValidator,
  updateRatingValidator,
  listOwnerRatingsValidator,
  replyToRatingValidator,
};
