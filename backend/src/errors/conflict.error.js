const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected', details = null) {
    super(message, HTTP_STATUS.CONFLICT, details);
  }
}

module.exports = ConflictError;
