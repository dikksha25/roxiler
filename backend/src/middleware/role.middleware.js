const ForbiddenError = require('../errors/forbidden.error');
const UnauthorizedError = require('../errors/unauthorized.error');

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * @param  {...string} allowedRoles - List of authorized roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context is missing.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
      );
    }

    next();
  };
};

module.exports = authorize;
