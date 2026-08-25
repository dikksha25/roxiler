const helmet = require('helmet');
const cors = require('cors');
const corsOptions = require('../config/cors.config');

/**
 * Configure standard security headers and policies
 */
const applySecurityMiddleware = (app) => {
  // Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // CORS policy
  app.use(cors(corsOptions));
};

module.exports = applySecurityMiddleware;
