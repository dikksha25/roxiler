const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const envConfig = require('../config/env.config');
const UnauthorizedError = require('../errors/unauthorized.error');
const tokenRevocationRegistry = require('./tokenRevocation.util');

const JWT_OPTIONS = {
  algorithm: 'HS256',
  issuer: 'store-rating-platform',
  audience: 'store-rating-client',
};

/**
 * Generate signed JWT token with production-grade security attributes
 */
const generateToken = (payload) => {
  const jti = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      jti,
    },
    envConfig.jwt.secret,
    {
      expiresIn: envConfig.jwt.expiresIn,
      algorithm: JWT_OPTIONS.algorithm,
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    }
  );
};

/**
 * Verify JWT token safely with algorithm enforcement and revocation checking
 */
const verifyToken = (token) => {
  if (!token) {
    throw new UnauthorizedError('Authentication token is required.');
  }

  // Check if token was revoked via logout or password change
  if (tokenRevocationRegistry.isRevoked(token)) {
    throw new UnauthorizedError('Authentication session has been revoked. Please sign in again.');
  }

  try {
    const decoded = jwt.verify(token, envConfig.jwt.secret, {
      algorithms: [JWT_OPTIONS.algorithm],
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Authentication token has expired. Please sign in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid or forged authentication token.');
    }
    throw new UnauthorizedError('Authentication failed. Malformed token.');
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
  JWT_OPTIONS,
};
