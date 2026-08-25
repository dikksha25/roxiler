const express = require('express');
const { getAllUsers, getPlatformStats } = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Admin only routes
router.get('/', authenticate, authorizeRoles(ROLES.SYSTEM_ADMIN), getAllUsers);
router.get('/stats', authenticate, authorizeRoles(ROLES.SYSTEM_ADMIN), getPlatformStats);

module.exports = router;
