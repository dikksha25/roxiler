const ApiResponse = require('../utils/apiResponse');
const config = require('../config/env');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * 404 Route Not Found handler
 */
const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Global Error Handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', {
    message: err.message,
    stack: config.isDevelopment ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Authentication token has expired');
  }

  // Database unique constraint violation (PostgreSQL 23505)
  if (err.code === '23505') {
    return ApiResponse.conflict(res, 'A record with this information already exists', {
      detail: err.detail,
    });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal server error';
  const errorDetails = config.isDevelopment ? { stack: err.stack } : null;

  return ApiResponse.error(res, message, statusCode, errorDetails);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
