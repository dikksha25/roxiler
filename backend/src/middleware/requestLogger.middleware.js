const morgan = require('morgan');
const envConfig = require('../config/env.config');

morgan.token('req-id', (req) => req.id || req.headers['x-request-id'] || '-');

const format = envConfig.isDevelopment
  ? '[:req-id] :method :url :status :response-time ms - :res[content-length]'
  : '[:req-id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" (:response-time ms)';

const requestLogger = morgan(format, {
  skip: (req) => req.url.includes('/health') && envConfig.isProduction,
});

module.exports = requestLogger;

