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

// Public routes
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.patch('/update-password', authenticate, validate(updatePasswordValidator), authController.updatePassword);

module.exports = router;
