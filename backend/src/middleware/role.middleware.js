const ForbiddenError = require('../errors/forbidden.error');
const UnauthorizedError = require('../errors/unauthorized.error');

/**
 * Reusable Role-Based Access Control (RBAC) Guard Middleware
 * Creates an Express middleware restricting route access to one or more allowed roles.
 *
 * @param  {...string} allowedRoles - List of permitted roles (e.g. ROLES.SYSTEM_ADMIN, ROLES.STORE_OWNER)
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  if (allowedRoles.length === 0) {
    throw new Error('authorize() middleware requires at least one allowed role.');
  }

  return (req, res, next) => {
    // 1. Ensure user context is present (requires prior authenticate middleware)
    if (!req.user) {
      throw new UnauthorizedError('Authentication required. Missing user session.');
    }

    // 2. Check if the user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`
      );
    }

    next();
  };
};

module.exports = authorize;
