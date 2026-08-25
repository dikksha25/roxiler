const HTTP_STATUS = require('../constants/httpStatus.constant');

/**
 * Base Application Error
 * Represents operational, known errors that can be handled gracefully
 */
class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} [statusCode=500] - HTTP status code
   * @param {any} [details=null] - Additional error payload / field errors
   * @param {boolean} [isOperational=true] - Distinguishes operational vs programmer errors
   */
  constructor(
    message = 'An unexpected error occurred',
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details = null,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
