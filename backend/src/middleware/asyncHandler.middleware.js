/**
 * Higher-order wrapper for async Express route handlers
 * Automatically catches rejected promises and forwards to next(error)
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
