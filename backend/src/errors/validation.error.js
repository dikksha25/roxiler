const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class ValidationError extends AppError {
  constructor(message = 'Validation failed for request parameters', validationErrors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, validationErrors);
    this.validationErrors = validationErrors;
  }
}

module.exports = ValidationError;
