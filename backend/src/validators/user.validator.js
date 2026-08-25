const { query, param, body } = require('express-validator');
const { ALL_ROLES } = require('../constants/roles.constant');

const listUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'role', 'created_at'])
    .withMessage('sortBy must be one of: name, email, role, created_at'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),
];

const getUserByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID parameter is required'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
];

module.exports = {
  listUsersValidator,
  getUserByIdValidator,
  updateProfileValidator,
};
