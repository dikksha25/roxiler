const { Pool } = require('pg');
const config = require('./env');

let pool = null;
let isConnected = false;
let lastDbError = null;

try {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl,
    max: config.db.max,
    idleTimeoutMillis: config.db.idleTimeoutMillis,
    connectionTimeoutMillis: config.db.connectionTimeoutMillis,
  });

  pool.on('error', (err) => {
    console.error('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
    isConnected = false;
    lastDbError = err.message;
  });
} catch (err) {
  console.error('⚠️ Failed to initialize PostgreSQL pool:', err.message);
  lastDbError = err.message;
}

/**
 * Execute a query against the PostgreSQL pool
 * @param {string} text - SQL query string
 * @param {Array} [params] - Query parameters
 */
const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.isDevelopment && duration > 100) {
      console.log(`[DB Slow Query] ${duration}ms | ${text}`);
    }
    return res;
  } catch (error) {
    lastDbError = error.message;
    throw error;
  }
};

/**
 * Test PostgreSQL connectivity
 * @returns {Promise<{ connected: boolean, message: string, serverTime?: string }>}
 */
const testConnection = async () => {
  if (!pool) {
    return {
      connected: false,
      message: 'PostgreSQL pool is not configured.',
      error: lastDbError,
    };
  }

  try {
    const res = await pool.query('SELECT NOW() AS now, current_database() AS db_name, version() AS db_version');
    isConnected = true;
    lastDbError = null;
    return {
      connected: true,
      message: 'Connected to PostgreSQL database successfully',
      database: res.rows[0].db_name,
      serverTime: res.rows[0].now,
      version: res.rows[0].db_version,
    };
  } catch (error) {
    isConnected = false;
    lastDbError = error.message;
    return {
      connected: false,
      message: `Database connection unavailable (${error.message}). Please verify PostgreSQL is running.`,
      error: error.message,
    };
  }
};

/**
 * Get current DB status
 */
const getStatus = () => ({
  isConnected,
  lastDbError,
  config: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
  },
});

module.exports = {
  pool,
  query,
  testConnection,
  getStatus,
};
