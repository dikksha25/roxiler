const UserModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { ROLES } = require('../constants/roles');

class AuthService {
  /**
   * Register a new user
   */
  static async register({ name, email, password, address, role = ROLES.NORMAL_USER }) {
    // Check if email already registered
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(password);

    const newUser = await UserModel.create({
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
   * Authenticate a user by credentials
   */
  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
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
   * Get authenticated user profile
   */
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = AuthService;
