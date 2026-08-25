const userRepository = require('../database/repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');
const { ROLES } = require('../constants/roles.constant');
const ConflictError = require('../errors/conflict.error');
const UnauthorizedError = require('../errors/unauthorized.error');
const NotFoundError = require('../errors/notFound.error');
const BadRequestError = require('../errors/badRequest.error');

class AuthService {
  /**
   * Universal Login for all user roles (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER)
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new BadRequestError('Email and password are both required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    };
  }

  /**
   * Self-Registration for Normal Users
   * Note: Always forces role to NORMAL_USER. Public requests cannot create SYSTEM_ADMIN or STORE_OWNER.
   */
  async register({ name, email, password, address }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    
    // Security Rule: Public self-registration is strictly locked to NORMAL_USER
    const enforcedRole = ROLES.NORMAL_USER;

    const newUser = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      address: address ? address.trim() : null,
      role: enforcedRole,
    });

    const token = generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
        createdAt: newUser.created_at,
      },
      token,
    };
  }

  /**
   * Retrieve current user profile (GET /api/v1/auth/me)
   */
  async getProfile(userId) {
    const user = await userRepository.findUserProfileById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return user;
  }

  /**
   * Secure Password Update for all authenticated roles
   */
  async updatePassword(userId, { currentPassword, newPassword, confirmPassword }, token = null, exp = null) {
    if (confirmPassword !== undefined && confirmPassword !== null && confirmPassword !== '' && confirmPassword !== newPassword) {
      throw new BadRequestError('New password and confirmation do not match.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password cannot be identical to your current password.');
    }

    const userProfile = await this.getProfile(userId);
    const user = await userRepository.findByEmail(userProfile.email);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (!user.password_hash) {
      throw new BadRequestError('Current password provided is incorrect.');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);

    if (!isMatch) {
      throw new BadRequestError('Current password provided is incorrect.');
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, newHash);

    // Invalidate the current session token upon password change
    if (token) {
      const tokenRevocationRegistry = require('../utils/tokenRevocation.util');
      tokenRevocationRegistry.revoke(token, exp);
    }

    return { message: 'Password updated successfully. Please use your new password on subsequent logins.' };
  }

  /**
   * Logout and invalidate active JWT token
   */
  async logout(_userId, token = null, exp = null) {
    if (token) {
      const tokenRevocationRegistry = require('../utils/tokenRevocation.util');
      tokenRevocationRegistry.revoke(token, exp);
    }
    return { message: 'Logged out successfully.' };
  }
}

module.exports = new AuthService();
