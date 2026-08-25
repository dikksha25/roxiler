const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, HTTP_STATUS.NOT_FOUND, details);
  }
}

module.exports = NotFoundError;
