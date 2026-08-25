const NotFoundError = require('../errors/notFound.error');

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Resource not found: Cannot ${req.method} ${req.originalUrl}`));
};

module.exports = notFoundHandler;
