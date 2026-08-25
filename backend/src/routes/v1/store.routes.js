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

// Public store directory & store detail
router.get('/', validate(listStoresValidator), storeController.getStores);

// Store Owner specific endpoint
router.get(
  '/my-stores',
  authenticate,
  authorize(ROLES.STORE_OWNER),
  storeController.getMyStores
);

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
