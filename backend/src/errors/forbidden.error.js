const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden: Insufficient permissions', details = null) {
    super(message, HTTP_STATUS.FORBIDDEN, details);
  }
}

module.exports = ForbiddenError;
