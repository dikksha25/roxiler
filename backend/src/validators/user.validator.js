const { body, param, query } = require('express-validator');
const { ROLES } = require('../constants/roles.constant');

const validRoles = Object.values(ROLES);

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/)
    .withMessage('Password must contain at least one special character'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(validRoles)
    .withMessage(`Role must be one of: [${validRoles.join(', ')}]`),
];

const listUsersValidator = [
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
    .isIn(['name', 'email', 'address', 'role', 'created_at'])
    .withMessage('sortBy must be one of: [name, email, address, role, created_at]'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),

  query('role')
    .optional()
    .isIn(validRoles)
    .withMessage(`Role filter must be one of: [${validRoles.join(', ')}]`),

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
];

const getUserByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID integer is required'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
];

module.exports = {
  createUserValidator,
  listUsersValidator,
  getUserByIdValidator,
  updateProfileValidator,
};
