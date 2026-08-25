const asyncHandler = require('./asyncHandler.middleware');
const authenticate = require('./auth.middleware');
const authorize = require('./role.middleware');
const validate = require('./validate.middleware');
const errorHandler = require('./error.middleware');
const notFoundHandler = require('./notFound.middleware');
const rateLimiter = require('./rateLimiter.middleware');
const requestLogger = require('./requestLogger.middleware');
const applySecurityMiddleware = require('./security.middleware');

module.exports = {
  asyncHandler,
  authenticate,
  authorize,
  validate,
  errorHandler,
  notFoundHandler,
  rateLimiter,
  requestLogger,
  applySecurityMiddleware,
};
