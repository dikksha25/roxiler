const express = require('express');
const dashboardController = require('../../controllers/dashboard.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles.constant');

const router = express.Router();

// General adaptive dashboard (any authenticated user)
router.get('/', authenticate, dashboardController.getDashboard);

// Role-restricted dashboard endpoints
router.get('/admin', authenticate, authorize(ROLES.SYSTEM_ADMIN), dashboardController.getAdminDashboard);
router.get('/owner', authenticate, authorize(ROLES.STORE_OWNER, ROLES.SYSTEM_ADMIN), dashboardController.getOwnerDashboard);
router.get('/store-owner', authenticate, authorize(ROLES.STORE_OWNER, ROLES.SYSTEM_ADMIN), dashboardController.getOwnerDashboard);
router.get('/user', authenticate, authorize(ROLES.NORMAL_USER), dashboardController.getUserDashboard);

module.exports = router;
