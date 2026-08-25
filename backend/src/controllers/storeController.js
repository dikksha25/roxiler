const StoreModel = require('../models/storeModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * List all stores (available for public/users/admin)
 */
const getAllStores = async (req, res, next) => {
  try {
    const { search = '', limit = 50, offset = 0 } = req.query;
    const stores = await StoreModel.findAll({
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    const total = await StoreModel.count();
    return ApiResponse.success(res, 'Stores retrieved successfully', { stores, total });
  } catch (error) {
    next(error);
  }
};

/**
 * Get store details by ID
 */
const getStoreById = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) {
      return ApiResponse.notFound(res, 'Store not found');
    }
    return ApiResponse.success(res, 'Store retrieved successfully', store);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new store (Admin or Store Owner)
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    // If store owner is creating, set ownerId to self
    const targetOwnerId = req.user.role === 'STORE_OWNER' ? req.user.id : ownerId;
    const newStore = await StoreModel.create({
      name,
      email,
      address,
      ownerId: targetOwnerId,
    });
    return ApiResponse.created(res, 'Store created successfully', newStore);
  } catch (error) {
    next(error);
  }
};

/**
 * Get stores owned by current Store Owner
 */
const getMyStores = async (req, res, next) => {
  try {
    const stores = await StoreModel.findByOwnerId(req.user.id);
    return ApiResponse.success(res, 'Owner stores retrieved successfully', stores);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  getMyStores,
};
