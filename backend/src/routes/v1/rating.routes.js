const express = require('express');
const ratingController = require('../../controllers/rating.controller');
const {
  submitRatingValidator,
  listStoreRatingsValidator,
  myRatingValidator,
} = require('../../validators/rating.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// Public: View ratings for a specific store
router.get('/store/:storeId', validate(listStoreRatingsValidator), ratingController.getStoreRatings);

// Normal User: View own rating for a store
router.get('/store/:storeId/my-rating', authenticate, validate(myRatingValidator), ratingController.getMyRatingForStore);

// Normal User: View all ratings submitted by user
router.get('/my-ratings', authenticate, authorize(ROLES.NORMAL_USER), ratingController.getMyRatings);

// Normal User: Submit or edit rating
router.post(
  '/',
  authenticate,
  authorize(ROLES.NORMAL_USER),
  validate(submitRatingValidator),
  ratingController.submitRating
);

module.exports = router;
