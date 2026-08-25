const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const storeRoutes = require('./store.routes');
const ratingRoutes = require('./rating.routes');
const dashboardRoutes = require('./dashboard.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount all v1 resource sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);

module.exports = router;
