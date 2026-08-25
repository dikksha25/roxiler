const express = require('express');
const ratingController = require('../../controllers/rating.controller');
const {
  createRatingValidator,
  updateRatingByStoreIdValidator,
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

// NORMAL_USER: Modify submitted rating by store ID (PUT /api/v1/ratings/:storeId or PATCH)
router.put(
  '/:storeId',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(updateRatingByStoreIdValidator),
  ratingController.modifyRatingByStoreId
);

router.patch(
  '/:storeId',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(updateRatingByStoreIdValidator),
  ratingController.modifyRatingByStoreId
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
