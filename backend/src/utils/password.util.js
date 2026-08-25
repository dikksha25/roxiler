const bcrypt = require('bcryptjs');
const envConfig = require('../config/env.config');

// Constant-time dummy hash for side-channel timing equalization
const DUMMY_BCRYPT_HASH = bcrypt.hashSync('DummyPasswordSecurityConstant123!', envConfig.security.bcryptRounds || 10);

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
  DUMMY_BCRYPT_HASH,
};

