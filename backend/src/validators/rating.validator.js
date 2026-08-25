const { body, param, query } = require('express-validator');

const submitRatingValidator = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
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
    .isIn(['rating', 'created_at'])
    .withMessage('sortBy must be rating or created_at'),
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
