const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');
const UnauthorizedError = require('../errors/unauthorized.error');

/**
 * Generate signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    envConfig.jwt.secret,
    {
      expiresIn: envConfig.jwt.expiresIn,
    }
  );
};

/**
 * Verify JWT token safely
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, envConfig.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Authentication token has expired. Please sign in again.');
    }
    throw new UnauthorizedError('Invalid or malformed authentication token.');
  }
};

/**
 * Decode JWT token without verification
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
