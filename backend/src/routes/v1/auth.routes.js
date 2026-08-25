const express = require('express');
const authController = require('../../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} = require('../../validators/auth.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const rateLimiter = require('../../middleware/rateLimiter.middleware');

const router = express.Router();

const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
});

// Public routes (Unified Login for all 3 roles)
router.post('/register', authRateLimit, validate(registerValidator), authController.register);
router.post('/login', authRateLimit, validate(loginValidator), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.patch('/update-password', authenticate, authRateLimit, validate(updatePasswordValidator), authController.updatePassword);

module.exports = router;
