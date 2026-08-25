const { Pool } = require('pg');
const dbConfig = require('../config/db.config');
const envConfig = require('../config/env.config');

let pool = null;
let isConnected = false;
let lastDbError = null;

try {
  pool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl,
    max: dbConfig.max,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
  });

  pool.on('error', (err) => {
    console.error('⚠️ Unexpected idle client error on PostgreSQL pool:', err.message);
    isConnected = false;
    lastDbError = err.message;
  });
} catch (err) {
  console.error('⚠️ Failed to initialize PostgreSQL pool:', err.message);
  lastDbError = err.message;
}

/**
 * Execute SQL query with parameterization
 */
const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (envConfig.isDevelopment && duration > 200) {
      console.warn(`[Slow Query] ${duration}ms | ${text}`);
    }
    return res;
  } catch (error) {
    lastDbError = error.message;
    throw error;
  }
};

/**
 * Test connectivity status
 */
const checkHealth = async () => {
  if (!pool) {
    return {
      connected: false,
      message: 'PostgreSQL connection pool not configured.',
      error: lastDbError,
    };
  }

  try {
    const res = await pool.query('SELECT NOW() AS now, current_database() AS db_name, version() AS version');
    isConnected = true;
    lastDbError = null;
    return {
      connected: true,
      message: 'PostgreSQL database connected',
      database: res.rows[0].db_name,
      serverTime: res.rows[0].now,
      version: res.rows[0].version,
    };
  } catch (error) {
    isConnected = false;
    lastDbError = error.message;
    return {
      connected: false,
      message: `Database connection unavailable (${error.message}).`,
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  query,
  checkHealth,
  getStatus: () => ({ isConnected, lastDbError }),
};
