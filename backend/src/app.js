const express = require('express');
const envConfig = require('./config/env.config');
const {
  applySecurityMiddleware,
  requestLogger,
  rateLimiter,
  notFoundHandler,
  errorHandler,
} = require('./middleware');
const apiRoutes = require('./routes');

const app = express();

// 1. Security Headers & CORS
applySecurityMiddleware(app);

// 2. Request Body Parsers
app.use(express.json({ limit: envConfig.security.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: envConfig.security.bodyLimit }));

// 3. HTTP Request Logging
app.use(requestLogger);

// 4. Rate Limiting
app.use('/api', rateLimiter());

// 5. Root Info Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Store Rating Application Backend API',
    status: 'online',
    version: '1.0.0',
    apiVersion: envConfig.apiVersion,
    docs: {
      health: `/api/${envConfig.apiVersion}/health`,
      auth: `/api/${envConfig.apiVersion}/auth`,
      users: `/api/${envConfig.apiVersion}/users`,
      stores: `/api/${envConfig.apiVersion}/stores`,
      ratings: `/api/${envConfig.apiVersion}/ratings`,
      dashboard: `/api/${envConfig.apiVersion}/dashboard`,
    },
  });
});

// 6. Mount Master API Routes
app.use('/api', apiRoutes);

// 7. 404 Handler for undefined routes
app.use(notFoundHandler);

// 8. Global Centralized Error Boundary
app.use(errorHandler);

module.exports = app;
