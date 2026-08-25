const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validate and sanitize environment variables
 */
const validateEnv = () => {
  const warnings = [];
  const errors = [];

  const requiredInProduction = ['JWT_SECRET', 'PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];

  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        errors.push(`Missing required environment variable in production: ${key}`);
      }
    }

    if (process.env.JWT_SECRET) {
      if (
        process.env.JWT_SECRET.includes('dev_super_secret') ||
        process.env.JWT_SECRET.includes('change_in_production')
      ) {
        errors.push('Cannot use development placeholder JWT_SECRET in production environment');
      }
      if (process.env.JWT_SECRET.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long in production');
      }
    }
  }

  // Check JWT secret strength in non-test
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET not provided in .env. Using fallback development key.');
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    warnings.forEach((w) => console.warn(`⚠️  [ENV Config Warning]: ${w}`));
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`❌ [ENV Config Fatal]: ${e}`));
    throw new Error('Environment configuration validation failed.');
  }
};

validateEnv();

const envConfig = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_super_secret_store_rating_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  db: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    database: process.env.PGDATABASE || 'store_rating_db',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.PG_MAX_POOL, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT, 10) || 5000,
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    bodyLimit: process.env.BODY_LIMIT || '1mb',
  },
});

module.exports = envConfig;
