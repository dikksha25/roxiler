const { AppError } = require('../errors');
const ApiResponse = require('../utils/apiResponse.util');
const envConfig = require('../config/env.config');
const HTTP_STATUS = require('../constants/httpStatus.constant');

/**
 * Global Centralized Error Boundary Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error in development/non-test environments
  if (!envConfig.isTest) {
    console.error('💥 [Global Error Handler]:', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode || 500,
      path: req.originalUrl,
      method: req.method,
      stack: envConfig.isDevelopment ? err.stack : undefined,
    });
  }

  // Handle JSON Syntax Parsing Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, 'Malformed JSON payload in request body', HTTP_STATUS.BAD_REQUEST);
  }

  // Handle PostgreSQL Database Errors
  if (err.code) {
    // Unique violation (23505)
    if (err.code === '23505') {
      return ApiResponse.error(
        res,
        'A record with this unique identifier or email already exists.',
        HTTP_STATUS.CONFLICT,
        { detail: err.detail }
      );
    }
    // Foreign key violation (23503)
    if (err.code === '23503') {
      return ApiResponse.error(
        res,
        'Referenced foreign entity does not exist.',
        HTTP_STATUS.BAD_REQUEST,
        { detail: err.detail }
      );
    }
    // Check constraint violation (23514)
    if (err.code === '23514') {
      return ApiResponse.error(
        res,
        'Data constraint violation (e.g., rating must be between 1 and 5).',
        HTTP_STATUS.BAD_REQUEST,
        { detail: err.detail }
      );
    }
  }

  // Handle AppError and its subclasses
  if (error instanceof AppError) {
    return ApiResponse.error(
      res,
      error.message,
      error.statusCode,
      error.details || (error.validationErrors ? error.validationErrors : null)
    );
  }

  // Fallback for unhandled / programmer errors
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = envConfig.isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error';
  const errorDetails = envConfig.isDevelopment ? { stack: err.stack } : null;

  return ApiResponse.error(res, message, statusCode, errorDetails);
};

module.exports = errorHandler;
