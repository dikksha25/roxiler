const express = require('express');
const ratingController = require('../../controllers/rating.controller');
const {
  createRatingValidator,
  updateRatingValidator,
} = require('../../validators/rating.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// NORMAL_USER: Submit rating for a store
router.post(
  '/',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(createRatingValidator),
  ratingController.submitRating
);

// NORMAL_USER: Modify submitted rating
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(updateRatingValidator),
  ratingController.updateRating
);

// NORMAL_USER: View my submitted ratings
router.get(
  '/my-ratings',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  ratingController.getMyRatings
);

// STORE_OWNER & SYSTEM_ADMIN: View ratings for a specific store
router.get(
  '/store/:storeId',
  authenticate,
  authorize(ROLES.STORE_OWNER, ROLES.SYSTEM_ADMIN),
  ratingController.getStoreRatings
);

module.exports = router;
