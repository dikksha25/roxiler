const userRepository = require('../database/repositories/user.repository');
const storeRepository = require('../database/repositories/store.repository');
const ratingRepository = require('../database/repositories/rating.repository');
const { hashPassword } = require('../utils/password.util');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');
const ConflictError = require('../errors/conflict.error');
const { ROLES } = require('../constants/roles.constant');

class UserService {
  /**
   * Admin creates a new user with chosen role (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER)
   */
  async createUser({ name, email, password, address, role }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    const newUser = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      address: address ? address.trim() : null,
      role: role || ROLES.NORMAL_USER,
    });

    return newUser;
  }

  /**
   * List users with multi-field filtering, sorting, and pagination
   */
  async listUsers(parsedQuery) {
    const {
      limit,
      offset,
      page,
      sortBy,
      sortOrder,
      search,
      role,
      name,
      email,
      address,
    } = parsedQuery;

    const { items, total } = await userRepository.findPaginated({
      search,
      role,
      name,
      email,
      address,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { users: items, pagination };
  }

  /**
   * Get single user profile by ID with role-specific enrichment (e.g. store & rating data for STORE_OWNER)
   */
  async getUserById(userId) {
    const user = await userRepository.findUserProfileById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} was not found.`);
    }

    // Role-specific enrichment for STORE_OWNER
    if (user.role === ROLES.STORE_OWNER) {
      const ownedStores = await storeRepository.findByOwnerId(user.id);
      user.owned_stores = ownedStores.map((st) => ({
        id: st.id,
        name: st.name,
        email: st.email,
        address: st.address,
        average_rating: st.average_rating || '0.00',
        overall_rating: st.overall_rating || '0.00',
        rating_count: st.rating_count || 0,
      }));

      // Calculate aggregate store performance
      const totalReviews = user.owned_stores.reduce((acc, curr) => acc + (curr.rating_count || 0), 0);
      user.total_ratings_received = totalReviews;
    } else if (user.role === ROLES.NORMAL_USER) {
      try {
        const ratings = await ratingRepository.findByUserId(user.id);
        user.total_ratings_submitted = (ratings && ratings.length) || 0;
      } catch {
        user.total_ratings_submitted = 0;
      }
    }

    return user;
  }

  /**
   * Update own profile
   */
  async updateProfile(userId, { name, address }) {
    const updatedUser = await userRepository.updateProfile(userId, { name, address });
    if (!updatedUser) {
      throw new NotFoundError('User not found.');
    }
    return updatedUser;
  }
}

module.exports = new UserService();
