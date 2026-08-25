const storeRepository = require('../database/repositories/store.repository');
const userRepository = require('../database/repositories/user.repository');
const PaginationUtil = require('../utils/pagination.util');
const NotFoundError = require('../errors/notFound.error');
const BadRequestError = require('../errors/badRequest.error');
const { ROLES } = require('../constants/roles.constant');

class StoreService {
  /**
   * Admin creates a new store associated with a valid STORE_OWNER
   */
  async createStore({ name, email, address, ownerId, owner_id }) {
    const targetOwnerId = ownerId || owner_id || null;
    let ownerName = null;
    let ownerEmail = null;

    if (targetOwnerId) {
      const owner = await userRepository.findUserProfileById(targetOwnerId);
      if (!owner) {
        throw new BadRequestError(`Referenced store owner with ID ${targetOwnerId} does not exist.`);
      }

      if (owner.role !== ROLES.STORE_OWNER) {
        throw new BadRequestError(
          `Referenced owner must have the STORE_OWNER role. User ID ${targetOwnerId} has role '${owner.role}'.`
        );
      }

      ownerName = owner.name;
      ownerEmail = owner.email;
    }

    const newStore = await storeRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      ownerId: targetOwnerId ? parseInt(targetOwnerId, 10) : null,
      owner_name: ownerName,
      owner_email: ownerEmail,
    });

    return newStore;
  }

  /**
   * List stores with dynamic overall rating calculations, multi-field filtering, and sorting
   */
  async listStores(parsedQuery) {
    const {
      limit,
      offset,
      page,
      search,
      ownerId,
      sortBy,
      sortOrder,
      name,
      email,
      address,
    } = parsedQuery;

    const { items, total } = await storeRepository.findPaginated({
      search,
      ownerId,
      name,
      email,
      address,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const pagination = PaginationUtil.buildMeta(total, page, limit);

    return { stores: items, pagination };
  }

  /**
   * Get store detail with dynamic overall rating calculation and owner details
   */
  async getStoreById(storeId) {
    const store = await storeRepository.findDetailById(storeId);
    if (!store) {
      throw new NotFoundError(`Store with ID ${storeId} was not found.`);
    }
    return store;
  }

  /**
   * List stores owned by a specific STORE_OWNER
   */
  async getStoresByOwner(ownerId) {
    return await storeRepository.findByOwnerId(ownerId);
  }

  /**
   * Update store attributes
   */
  async updateStore(storeId, updateData) {
    const existing = await storeRepository.findById(storeId);
    if (!existing) {
      throw new NotFoundError(`Store with ID ${storeId} was not found.`);
    }

    if (updateData.ownerId) {
      const owner = await userRepository.findUserProfileById(updateData.ownerId);
      if (!owner) {
        throw new BadRequestError(`Referenced owner with ID ${updateData.ownerId} does not exist.`);
      }
      if (owner.role !== ROLES.STORE_OWNER) {
        throw new BadRequestError(`Referenced owner must have STORE_OWNER role.`);
      }
    }

    return await storeRepository.update(storeId, updateData);
  }
}

module.exports = new StoreService();
