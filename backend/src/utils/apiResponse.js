const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Standardized API Response Utilities
 */
class ApiResponse {
  /**
   * Success Response
   */
  static success(res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Created (201) Response
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Error Response
   */
  static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errors,
    });
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res, message = 'Authentication required or invalid token') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res, message = 'You do not have permission to perform this action') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Not Found (404)
   */
  static notFound(res, message = 'Requested resource was not found') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Conflict (409)
   */
  static conflict(res, message = 'Resource conflict detected') {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = ApiResponse;
