const AppError = require('./app.error');
const HTTP_STATUS = require('../constants/httpStatus.constant');

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, details);
  }
}

module.exports = BadRequestError;
