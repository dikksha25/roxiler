const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details = null) {
    super(message, HTTP_STATUS.UNAUTHORIZED, details);
  }
}

module.exports = UnauthorizedError;
