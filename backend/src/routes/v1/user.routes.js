const express = require('express');
const userController = require('../../controllers/user.controller');
const {
  createUserValidator,
  listUsersValidator,
  getUserByIdValidator,
  updateProfileValidator,
} = require('../../validators/user.validator');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// System Administrator Routes (Protected)
router.post(
  '/',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  validate(createUserValidator),
  userController.createUser
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  validate(listUsersValidator),
  userController.getUsers
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  validate(getUserByIdValidator),
  userController.getUserById
);

// Authenticated User Profile Update
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileValidator),
  userController.updateProfile
);

module.exports = router;
