const ratingRepository = require('../database/repositories/rating.repository');
const storeRepository = require('../database/repositories/store.repository');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');

class RatingService {
  /**
   * Submit or update rating for a store
   */
  async submitRating({ userId, storeId, rating, comment }) {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${storeId} does not exist`);
    }

    const savedRating = await ratingRepository.upsert({
      userId,
      storeId: parseInt(storeId, 10),
      rating: parseInt(rating, 10),
      comment,
    });

    return savedRating;
  }

  /**
   * List ratings for a specific store with pagination and sorting
   */
  async listStoreRatings(storeId, parsedQuery) {
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${storeId} was not found`);
    }

    const { limit, offset, page, sortBy, sortOrder } = parsedQuery;
    const { items, total } = await ratingRepository.findStoreRatingsPaginated(storeId, {
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { ratings: items, pagination };
  }

  /**
   * Get current user's rating for a specific store
   */
  async getUserRatingForStore(userId, storeId) {
    return await ratingRepository.findByUserAndStore(userId, storeId);
  }

  /**
   * Get ratings submitted by current user across stores
   */
  async listUserRatings(userId, parsedQuery) {
    const { limit, offset, page } = parsedQuery;
    const { items, total } = await ratingRepository.findUserRatingsPaginated(userId, {
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { ratings: items, pagination };
  }
}

module.exports = new RatingService();
