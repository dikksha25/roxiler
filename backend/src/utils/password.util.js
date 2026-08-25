const bcrypt = require('bcryptjs');
const envConfig = require('../config/env.config');

/**
 * Hash plain text password using bcrypt
 */
const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password string is required for hashing');
  }
  const salt = await bcrypt.genSalt(envConfig.security.bcryptRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain text password against hash
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
