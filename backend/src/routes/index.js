const express = require('express');
const v1Router = require('./v1');

const router = express.Router();

// Mount API version 1 at /v1
router.use('/v1', v1Router);

// Default / fallback route: /api forward to /api/v1 for convenience
router.use('/', v1Router);

module.exports = router;
