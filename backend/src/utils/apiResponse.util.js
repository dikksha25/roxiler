const HTTP_STATUS = require('../constants/httpStatus.constant');

/**
 * Enterprise API Response Builder
 */
class ApiResponse {
  /**
   * Success response format
   */
  static success(res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK, pagination = null) {
    const payload = {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Resource Created (201)
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, message, data, HTTP_STATUS.CREATED);
  }

  /**
   * Standard error response format
   */
  static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
