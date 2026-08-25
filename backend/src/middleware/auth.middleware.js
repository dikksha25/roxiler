const { verifyToken } = require('../utils/jwt.util');
const UnauthorizedError = require('../errors/unauthorized.error');

/**
 * Authentication Guard Middleware
 * Validates JWT Bearer token and attaches decoded payload to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing. Please provide a Bearer token in the Authorization header.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Malformed authorization header. Token is required.');
  }

  const decoded = verifyToken(token);
  req.user = decoded;
  next();
};

module.exports = authenticate;
