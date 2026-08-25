const storeRepository = require('../database/repositories/store.repository');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');

class StoreService {
  /**
   * List stores with pagination, search, filter, and sorting
   */
  async listStores(parsedQuery) {
    const { search, ownerId, sortBy, sortOrder, limit, offset, page } = parsedQuery;

    const { items, total } = await storeRepository.findPaginated({
      search,
      ownerId,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { stores: items, pagination };
  }

  /**
   * Get store detail by ID
   */
  async getStoreById(id) {
    const store = await storeRepository.findDetailById(id);
    if (!store) {
      throw new NotFoundError(`Store with ID ${id} was not found`);
    }
    return store;
  }

  /**
   * Create new store
   */
  async createStore({ name, email, address, ownerId }) {
    return await storeRepository.create({ name, email, address, ownerId });
  }

  /**
   * Update store
   */
  async updateStore(id, updateData) {
    const existing = await storeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Store with ID ${id} was not found`);
    }
    return await storeRepository.update(id, updateData);
  }

  /**
   * Get stores owned by a specific owner
   */
  async getOwnerStores(ownerId) {
    return await storeRepository.findByOwnerId(ownerId);
  }
}

module.exports = new StoreService();
