const ForbiddenError = require('../errors/forbidden.error');
const UnauthorizedError = require('../errors/unauthorized.error');

/**
 * Role Hierarchy:
 * - SYSTEM_ADMIN can access all capabilities of SYSTEM_ADMIN, STORE_OWNER, and NORMAL_USER
 * - STORE_OWNER can access all capabilities of STORE_OWNER and NORMAL_USER
 * - NORMAL_USER can access capabilities of NORMAL_USER
 */
const ROLE_HIERARCHY = {
  SYSTEM_ADMIN: ['SYSTEM_ADMIN', 'STORE_OWNER', 'NORMAL_USER'],
  STORE_OWNER: ['STORE_OWNER', 'NORMAL_USER'],
  NORMAL_USER: ['NORMAL_USER'],
};

/**
 * Reusable Role-Based Access Control (RBAC) Guard Middleware with Role Hierarchy
 *
 * @param  {...string} allowedRoles - List of permitted roles (e.g. ROLES.NORMAL_USER, ROLES.STORE_OWNER)
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  if (allowedRoles.length === 0) {
    throw new Error('authorize() middleware requires at least one allowed role.');
  }

  return (req, res, next) => {
    // 1. Ensure user context is present
    if (!req.user) {
      throw new UnauthorizedError('Authentication required. Missing user session.');
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_HIERARCHY[userRole] || [userRole];

    // 2. Check if the user's role or inherited roles match any allowed role
    const hasPermission = allowedRoles.some((allowedRole) =>
      userPermissions.includes(allowedRole)
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${userRole}'.`
      );
    }

    next();
  };
};

module.exports = authorize;
