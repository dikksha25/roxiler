const { body, param, query } = require('express-validator');

const submitRatingValidator = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
  body('rating_value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating value must be an integer between 1 and 5 stars'),
  body().custom((body) => {
    if (body.rating === undefined && body.rating_value === undefined) {
      throw new Error('Rating value (1 to 5 stars) is required');
    }
    return true;
  }),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

const listStoreRatingsValidator = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
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
    .isIn(['rating', 'rating_value', 'created_at'])
    .withMessage('sortBy must be rating, rating_value, or created_at'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),
];

const myRatingValidator = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
];

module.exports = {
  submitRatingValidator,
  listStoreRatingsValidator,
  myRatingValidator,
};
