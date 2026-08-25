const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const tokenRevocationRegistry = require('./tokenRevocation.util');

const JWT_OPTIONS = {
  algorithm: 'HS256',
  issuer: 'store-rating-platform',
  audience: 'store-rating-client',
};

/**
 * Generate a signed JWT token for an authenticated user
 */
const generateToken = (user) => {
  const jti = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      jti,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      algorithm: JWT_OPTIONS.algorithm,
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    }
  );
};

/**
 * Verify a JWT token
 */
const verifyToken = (token) => {
  if (!token) {
    throw new Error('Authentication token is required.');
  }

  if (tokenRevocationRegistry.isRevoked(token)) {
    throw new Error('Session has been revoked.');
  }

  return jwt.verify(token, config.jwt.secret, {
    algorithms: [JWT_OPTIONS.algorithm],
    issuer: JWT_OPTIONS.issuer,
    audience: JWT_OPTIONS.audience,
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
