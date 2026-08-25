const { body, param, query } = require('express-validator');

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Store email is required')
    .isEmail()
    .withMessage('Please provide a valid store email')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required')
    .isLength({ min: 5, max: 400 })
    .withMessage('Address must be between 5 and 400 characters'),
  body('ownerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ownerId must be a valid user ID integer'),
];

const updateStoreValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID parameter is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid store email')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 400 })
    .withMessage('Address must be between 5 and 400 characters'),
];

const listStoresValidator = [
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
    .isIn(['name', 'created_at', 'average_rating'])
    .withMessage('sortBy must be one of: name, created_at, average_rating'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),
];

const getStoreByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID parameter is required'),
];

module.exports = {
  createStoreValidator,
  updateStoreValidator,
  listStoresValidator,
  getStoreByIdValidator,
};
