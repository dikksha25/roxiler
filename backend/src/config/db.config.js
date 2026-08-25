const envConfig = require('./env.config');

const dbConfig = Object.freeze({
  host: envConfig.db.host,
  port: envConfig.db.port,
  database: envConfig.db.database,
  user: envConfig.db.user,
  password: envConfig.db.password,
  ssl: envConfig.db.ssl,
  max: envConfig.db.max,
  idleTimeoutMillis: envConfig.db.idleTimeoutMillis,
  connectionTimeoutMillis: envConfig.db.connectionTimeoutMillis,
});

module.exports = dbConfig;
