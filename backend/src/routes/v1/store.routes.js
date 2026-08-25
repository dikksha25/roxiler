const express = require('express');
const storeController = require('../../controllers/store.controller');
const {
  createStoreValidator,
  updateStoreValidator,
  listStoresValidator,
  browseStoresForUserValidator,
  getStoreByIdValidator,
} = require('../../validators/store.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// Protected store browsing endpoint for NORMAL_USER (with personal rating resolution)
router.get(
  '/browse',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(browseStoresForUserValidator),
  storeController.browseStoresForUser
);

// Store Owner specific endpoint
router.get(
  '/my-stores',
  authenticate,
  authorize(ROLES.STORE_OWNER),
  storeController.getMyStores
);

// Public / General store directory
router.get('/', validate(listStoresValidator), storeController.getStores);

// Store details
router.get('/:id', validate(getStoreByIdValidator), storeController.getStoreById);

// System Administrator store creation & management
router.post(
  '/',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  validate(createStoreValidator),
  storeController.createStore
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  validate(updateStoreValidator),
  storeController.updateStore
);

module.exports = router;
