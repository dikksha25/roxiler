const { verifyToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Authentication required. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token has expired. Please login again.');
    }
    return ApiResponse.unauthorized(res, 'Invalid or malformed authentication token.');
  }
};

/**
 * Middleware to enforce role-based access control (RBAC)
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User authentication context is missing.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
