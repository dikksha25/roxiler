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

  pool.on('connect', () => {
    isConnected = true;
    lastDbError = null;
  });

  pool.on('error', (err) => {
    console.error('⚠️ Unexpected idle client error on PostgreSQL pool:', err.message);
    isConnected = false;
    lastDbError = err.message;
  });
} catch (err) {
  console.error('⚠️ Failed to initialize PostgreSQL connection pool:', err.message);
  lastDbError = err.message;
}

/**
 * Execute a parameterized query with duration logging
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
      console.warn(`[DB Slow Query] ${duration}ms | ${text.slice(0, 100)}...`);
    }
    return res;
  } catch (error) {
    lastDbError = error.message;
    throw error;
  }
};

/**
 * Execute operations within a managed database transaction
 * @param {Function} callback - Async function receiving client
 */
const withTransaction = async (callback) => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check PostgreSQL connectivity & server health
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
    const res = await pool.query(
      'SELECT NOW() AS now, current_database() AS db_name, version() AS version, pg_backend_pid() AS pid'
    );
    isConnected = true;
    lastDbError = null;
    return {
      connected: true,
      message: 'PostgreSQL database connected',
      database: res.rows[0].db_name,
      serverTime: res.rows[0].now,
      version: res.rows[0].version,
      pid: res.rows[0].pid,
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

/**
 * Get current pool utilization metrics
 */
const getPoolStats = () => {
  if (!pool) return null;
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    isConnected,
    lastDbError,
  };
};

module.exports = {
  pool,
  query,
  withTransaction,
  checkHealth,
  getPoolStats,
  getStatus: () => ({ isConnected, lastDbError }),
};
