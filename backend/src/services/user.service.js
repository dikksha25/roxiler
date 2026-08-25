const userRepository = require('../database/repositories/user.repository');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');

class UserService {
  /**
   * Get paginated list of users with filtering and sorting
   */
  async listUsers(parsedQuery) {
    const { search, role, sortBy, sortOrder, limit, offset, page } = parsedQuery;

    const { items, total } = await userRepository.findPaginated({
      search,
      role,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { users: items, pagination };
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await userRepository.findUserProfileById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} was not found`);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const updated = await userRepository.updateProfile(userId, data);
    if (!updated) {
      throw new NotFoundError(`User with ID ${userId} was not found`);
    }
    return updated;
  }
}

module.exports = new UserService();
