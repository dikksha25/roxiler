const express = require('express');
const { body } = require('express-validator');
const {
  submitRating,
  getStoreRatings,
  getMyRatingForStore,
} = require('../controllers/ratingController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

const ratingValidation = [
  body('storeId').isInt({ min: 1 }).withMessage('Valid store ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  validate,
];

// Ratings for a specific store
router.get('/store/:storeId', getStoreRatings);

// Check current user's rating for a store
router.get('/store/:storeId/my-rating', authenticate, getMyRatingForStore);

// Submit or modify rating (Normal users only)
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.NORMAL_USER),
  ratingValidation,
  submitRating
);

module.exports = router;
