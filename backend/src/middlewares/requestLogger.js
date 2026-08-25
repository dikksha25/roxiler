const morgan = require('morgan');
const config = require('../config/env');

const format = config.isDevelopment
  ? ':method :url :status :response-time ms - :res[content-length]'
  : 'combined';

const requestLogger = morgan(format, {
  skip: (req) => req.url === '/api/health' && config.isProduction,
});

module.exports = requestLogger;
