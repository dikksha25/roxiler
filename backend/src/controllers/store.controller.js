const storeService = require('../services/store.service');
const ApiResponse = require('../utils/apiResponse.util');
const QueryParamsUtil = require('../utils/queryParams.util');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const MESSAGES = require('../constants/messages.constant');
const { ROLES } = require('../constants/roles.constant');

const listStores = asyncHandler(async (req, res) => {
  const parsedQuery = QueryParamsUtil.parse(req.query, {
    allowedSortFields: ['name', 'created_at', 'average_rating'],
    defaultSortBy: 'created_at',
  });

  const { stores, pagination } = await storeService.listStores(parsedQuery);
  return ApiResponse.success(res, MESSAGES.STORES_RETRIEVED, { stores }, 200, pagination);
});

const getStoreById = asyncHandler(async (req, res) => {
  const store = await storeService.getStoreById(parseInt(req.params.id, 10));
  return ApiResponse.success(res, 'Store retrieved', store);
});

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const targetOwnerId = req.user.role === ROLES.STORE_OWNER ? req.user.id : ownerId;

  const newStore = await storeService.createStore({
    name,
    email,
    address,
    ownerId: targetOwnerId,
  });

  return ApiResponse.created(res, MESSAGES.STORE_CREATED, newStore);
});

const updateStore = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  const updatedStore = await storeService.updateStore(storeId, req.body);
  return ApiResponse.success(res, MESSAGES.STORE_UPDATED, updatedStore);
});

const getMyStores = asyncHandler(async (req, res) => {
  const stores = await storeService.getOwnerStores(req.user.id);
  return ApiResponse.success(res, 'Owner stores retrieved', stores);
});

module.exports = {
  listStores,
  getStoreById,
  createStore,
  updateStore,
  getMyStores,
};
