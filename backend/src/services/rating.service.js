const ratingRepository = require('../database/repositories/rating.repository');
const storeRepository = require('../database/repositories/store.repository');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');
const ConflictError = require('../errors/conflict.error');
const BadRequestError = require('../errors/badRequest.error');

class RatingService {
  /**
   * Submit a new rating for a store (NORMAL_USER)
   */
  async submitRating(userId, { storeId, store_id, rating, ratingValue, comment }) {
    const targetStoreId = parseInt(storeId || store_id, 10);
    const targetRatingVal = parseInt(rating !== undefined ? rating : ratingValue, 10);

    if (isNaN(targetStoreId) || targetStoreId < 1) {
      throw new BadRequestError('Valid store ID is required.');
    }

    if (isNaN(targetRatingVal) || targetRatingVal < 1 || targetRatingVal > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5.');
    }

    // 1. Verify store exists
    const store = await storeRepository.findDetailById(targetStoreId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${targetStoreId} was not found.`);
    }

    // 2. Check if user already submitted a rating for this store
    const existingRating = await ratingRepository.findByUserAndStore(userId, targetStoreId);
    if (existingRating) {
      throw new ConflictError(
        'You have already submitted a rating for this store. Please use the update rating operation to modify your existing rating.'
      );
    }

    // 3. Create rating record
    const createdRating = await ratingRepository.create({
      userId,
      storeId: targetStoreId,
      ratingValue: targetRatingVal,
      comment: comment ? comment.trim() : null,
    });

    return createdRating;
  }

  /**
   * Modify an existing rating for a store (NORMAL_USER)
   * Target identified by store ID (PUT /api/v1/ratings/:storeId)
   */
  async modifyRatingByStoreId(userId, storeId, { rating, ratingValue, comment }) {
    const targetStoreId = parseInt(storeId, 10);
    const targetRatingVal = parseInt(rating !== undefined ? rating : ratingValue, 10);

    if (isNaN(targetStoreId) || targetStoreId < 1) {
      throw new BadRequestError('Valid store ID parameter is required.');
    }

    if (isNaN(targetRatingVal) || targetRatingVal < 1 || targetRatingVal > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5.');
    }

    // 1. Verify store exists
    const store = await storeRepository.findDetailById(targetStoreId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${targetStoreId} was not found.`);
    }

    // 2. Check if user has an existing rating for this store
    const existingRating = await ratingRepository.findByUserAndStore(userId, targetStoreId);
    if (!existingRating) {
      throw new NotFoundError(
        `No existing rating found for store ID ${targetStoreId}. Please submit a rating first.`
      );
    }

    // 3. Update the rating
    const updated = await ratingRepository.updateByUserAndStore(userId, targetStoreId, {
      ratingValue: targetRatingVal,
      comment: comment !== undefined ? (comment ? comment.trim() : null) : undefined,
    });

    return updated;
  }

  /**
   * Update an existing rating by rating ID (NORMAL_USER)
   */
  async updateRating(userId, ratingIdOrStoreId, { rating, ratingValue, comment }) {
    const targetRatingVal = rating !== undefined ? parseInt(rating, 10) : (ratingValue !== undefined ? parseInt(ratingValue, 10) : undefined);

    if (targetRatingVal !== undefined && (isNaN(targetRatingVal) || targetRatingVal < 1 || targetRatingVal > 5)) {
      throw new BadRequestError('Rating must be an integer between 1 and 5.');
    }

    // Find rating by ID or by (userId, storeId)
    let existingRating = await ratingRepository.findById(ratingIdOrStoreId);
    if (!existingRating) {
      existingRating = await ratingRepository.findByUserAndStore(userId, ratingIdOrStoreId);
    }

    if (!existingRating) {
      throw new NotFoundError('Rating record was not found.');
    }

    if (existingRating.user_id !== parseInt(userId, 10)) {
      throw new BadRequestError('You do not have permission to modify this rating.');
    }

    const updated = await ratingRepository.update(existingRating.id, {
      ratingValue: targetRatingVal,
      comment: comment !== undefined ? (comment ? comment.trim() : null) : undefined,
    });

    return updated;
  }

  /**
   * Dedicated paginated customer ratings retrieval for STORE_OWNER
   */
  async getOwnerRatings(ownerId, parsedQuery, userRole = null) {
    const {
      limit,
      offset,
      page,
      search,
      name,
      email,
      address,
      rating,
      storeId,
      sortBy,
      sortOrder,
    } = parsedQuery;

    // Object-Level Authorization: If a storeId is provided, ensure STORE_OWNER owns it
    if (storeId && userRole !== 'SYSTEM_ADMIN') {
      const targetStore = await storeRepository.findDetailById(storeId);
      if (!targetStore) {
        throw new NotFoundError(`Store with ID ${storeId} was not found.`);
      }
      if (targetStore.owner_id !== parseInt(ownerId, 10)) {
        const ForbiddenError = require('../errors/forbidden.error');
        throw new ForbiddenError('You do not have permission to view customer ratings for another merchant\'s store.');
      }
    }

    const { items, total } = await ratingRepository.findPaginatedForOwner(ownerId, {
      search,
      name,
      email,
      address,
      rating,
      storeId,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { ratings: items, pagination };
  }

  /**
   * Get ratings submitted by a specific user
   */
  async getUserRatings(userId) {
    return await ratingRepository.findByUserId(userId);
  }

  /**
   * Get ratings received by a specific store with object-level authorization
   */
  async getStoreRatings(storeId, requestingUser = null) {
    const targetStoreId = parseInt(storeId, 10);
    if (isNaN(targetStoreId) || targetStoreId < 1) {
      throw new BadRequestError('Valid store ID is required.');
    }

    const store = await storeRepository.findDetailById(targetStoreId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${targetStoreId} was not found.`);
    }

    // Object-Level Authorization: STORE_OWNER can only view ratings for their own stores
    if (requestingUser && requestingUser.role === 'STORE_OWNER') {
      if (store.owner_id !== parseInt(requestingUser.id, 10)) {
        const ForbiddenError = require('../errors/forbidden.error');
        throw new ForbiddenError('You do not have permission to view ratings for another merchant\'s store.');
      }
    }

    return await ratingRepository.findByStoreId(targetStoreId);
  }
}

module.exports = new RatingService();
