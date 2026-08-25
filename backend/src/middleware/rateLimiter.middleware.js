const envConfig = require('../config/env.config');
const ApiResponse = require('../utils/apiResponse.util');
const HTTP_STATUS = require('../constants/httpStatus.constant');

const requestsMap = new Map();

// Periodic cleanup of expired rate limit buckets
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestsMap.entries()) {
    if (now - data.startTime > envConfig.security.rateLimitWindowMs) {
      requestsMap.delete(ip);
    }
  }
}, 60000);

/**
 * Lightweight in-memory rate limiting middleware
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || envConfig.security.rateLimitWindowMs;
  const max = options.max || envConfig.security.rateLimitMax;

  return (req, res, next) => {
    // Skip in test environments
    if (envConfig.isTest) return next();

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const now = Date.now();

    let record = requestsMap.get(clientIp);

    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      requestsMap.set(clientIp, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return ApiResponse.error(
        res,
        'Too many requests from this IP. Please try again later.',
        HTTP_STATUS.TOO_MANY_REQUESTS,
        { retryAfterSeconds }
      );
    }

    next();
  };
};

module.exports = rateLimiter;
