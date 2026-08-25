const express = require('express');
const userController = require('../../controllers/user.controller');
const {
  listUsersValidator,
  getUserByIdValidator,
  updateProfileValidator,
} = require('../../validators/user.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// Admin only: List all users with filtering, sorting, pagination
router.get('/', authenticate, authorize(ROLES.SYSTEM_ADMIN), validate(listUsersValidator), userController.listUsers);

// Admin only: Get specific user
router.get('/:id', authenticate, authorize(ROLES.SYSTEM_ADMIN), validate(getUserByIdValidator), userController.getUserById);

// Authenticated user: Update own profile
router.patch('/profile', authenticate, validate(updateProfileValidator), userController.updateProfile);

module.exports = router;
