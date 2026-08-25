const express = require('express');
const storeController = require('../../controllers/store.controller');
const {
  createStoreValidator,
  updateStoreValidator,
  listStoresValidator,
  getStoreByIdValidator,
} = require('../../validators/store.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// Public: List stores with search, pagination, and sorting
router.get('/', validate(listStoresValidator), storeController.listStores);

// Store Owner only: View own stores
router.get('/my-stores', authenticate, authorize(ROLES.STORE_OWNER), storeController.getMyStores);

// Public: Get store details by ID
router.get('/:id', validate(getStoreByIdValidator), storeController.getStoreById);

// Admin & Store Owner: Create store
router.post(
  '/',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN, ROLES.STORE_OWNER),
  validate(createStoreValidator),
  storeController.createStore
);

// Admin & Store Owner: Update store
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN, ROLES.STORE_OWNER),
  validate(updateStoreValidator),
  storeController.updateStore
);

module.exports = router;
