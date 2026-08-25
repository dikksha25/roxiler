const { body, param, query } = require('express-validator');

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Store contact email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store physical address is required')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),

  body('ownerId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('ownerId must be a valid user ID integer'),

  body('owner_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('owner_id must be a valid user ID integer'),
];

const updateStoreValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),

  body('ownerId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('ownerId must be a valid user ID integer'),

  body('owner_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('owner_id must be a valid user ID integer'),
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
    .isIn(['name', 'email', 'address', 'rating', 'average_rating', 'created_at'])
    .withMessage('sortBy must be one of: [name, email, address, rating, average_rating, created_at]'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),

  query('name')
    .optional()
    .trim(),

  query('email')
    .optional()
    .trim(),

  query('address')
    .optional()
    .trim(),

  query('search')
    .optional()
    .trim(),

  query('ownerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ownerId must be a positive integer'),
];

const getStoreByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
];

module.exports = {
  createStoreValidator,
  updateStoreValidator,
  listStoresValidator,
  getStoreByIdValidator,
};
