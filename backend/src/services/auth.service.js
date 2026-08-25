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
   * Register a new user
   */
  async register({ name, email, password, address, role = ROLES.NORMAL_USER }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(password);
    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
      address,
      role: role || ROLES.NORMAL_USER,
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
   * Authenticate user by email & password
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
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
      },
      token,
    };
  }

  /**
   * Retrieve current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findUserProfileById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  /**
   * Change user password
   */
  async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestError('Current password provided does not match');
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, newHash);

    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();
