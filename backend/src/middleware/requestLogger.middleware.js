const morgan = require('morgan');
const envConfig = require('../config/env.config');

const format = envConfig.isDevelopment
  ? ':method :url :status :response-time ms - :res[content-length]'
  : 'combined';

const requestLogger = morgan(format, {
  skip: (req) => req.url.includes('/health') && envConfig.isProduction,
});

module.exports = requestLogger;
