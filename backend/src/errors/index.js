const AppError = require('./app.error');
const BadRequestError = require('./badRequest.error');
const UnauthorizedError = require('./unauthorized.error');
const ForbiddenError = require('./forbidden.error');
const NotFoundError = require('./notFound.error');
const ConflictError = require('./conflict.error');
const ValidationError = require('./validation.error');

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
