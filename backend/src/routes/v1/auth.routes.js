const express = require('express');
const authController = require('../../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} = require('../../validators/auth.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes (Unified Login for all 3 roles)
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.patch('/update-password', authenticate, validate(updatePasswordValidator), authController.updatePassword);

module.exports = router;
