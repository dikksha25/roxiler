const storeService = require('../services/store.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId, owner_id } = req.body;
  const store = await storeService.createStore({ name, email, address, ownerId, owner_id });
  return ApiResponse.created(res, MESSAGES.STORE_CREATED, store);
});

const getStores = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['name', 'email', 'address', 'rating', 'average_rating', 'created_at'],
    defaultSortBy: 'created_at',
  });

  parsedQuery.ownerId = req.query.ownerId ? parseInt(req.query.ownerId, 10) : null;
  parsedQuery.name = req.query.name || '';
  parsedQuery.email = req.query.email || '';
  parsedQuery.address = req.query.address || '';

  const { stores, pagination } = await storeService.listStores(parsedQuery);
  return ApiResponse.success(res, MESSAGES.STORES_RETRIEVED, { stores }, 200, pagination);
});

const browseStoresForUser = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['name', 'address', 'rating', 'average_rating', 'overall_rating', 'user_rating', 'my_rating', 'created_at'],
    defaultSortBy: 'created_at',
  });

  parsedQuery.name = req.query.name || '';
  parsedQuery.address = req.query.address || '';

  const { stores, pagination } = await storeService.browseStoresForUser(req.user.id, parsedQuery);
  return ApiResponse.success(res, 'User store directory retrieved successfully', { stores }, 200, pagination);
});

const getStoreById = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  const store = await storeService.getStoreById(storeId);
  return ApiResponse.success(res, 'Store details retrieved successfully', store);
});

const getMyStores = asyncHandler(async (req, res) => {
  const stores = await storeService.getStoresByOwner(req.user.id);
  return ApiResponse.success(res, 'Owner stores retrieved successfully', stores);
});

const updateStore = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  const updatedStore = await storeService.updateStore(storeId, req.body);
  return ApiResponse.success(res, MESSAGES.STORE_UPDATED, updatedStore);
});

module.exports = {
  createStore,
  getStores,
  browseStoresForUser,
  getStoreById,
  getMyStores,
  updateStore,
};
