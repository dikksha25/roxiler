const express = require('express');
const { body } = require('express-validator');
const {
  getAllStores,
  getStoreById,
  createStore,
  getMyStores,
} = require('../controllers/storeController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

const createStoreValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Store email is required')
    .isEmail()
    .withMessage('Please provide a valid store email')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required')
    .isLength({ min: 5, max: 400 })
    .withMessage('Address must be between 5 and 400 characters'),
  validate,
];

// Public & user routes
router.get('/', getAllStores);
router.get('/my-stores', authenticate, authorizeRoles(ROLES.STORE_OWNER), getMyStores);
router.get('/:id', getStoreById);

// Admin & Store Owner creation
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.STORE_OWNER),
  createStoreValidation,
  createStore
);

module.exports = router;
