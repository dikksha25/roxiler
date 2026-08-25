const crypto = require('crypto');

/**
 * In-Memory Sliding-Window JWT Token Revocation Registry
 * Tracks revoked tokens (from logout or password change) until their expiration.
 */
class TokenRevocationRegistry {
  constructor() {
    // Map of token identifier -> expiry timestamp in ms
    this.revokedTokens = new Map();

    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);

    // Prevent interval from hanging Node event loop on exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Compute a secure hash for the token string
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Revoke a token until its expiration time
   * @param {string} token - Raw JWT token or token hash
   * @param {number} exp - Token expiration timestamp in seconds (Unix timestamp)
   */
  revoke(token, exp) {
    if (!token) return;
    const tokenKey = this.hashToken(token);
    const expiryMs = exp ? exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.revokedTokens.set(tokenKey, expiryMs);
  }

  /**
   * Check if a token has been revoked
   * @param {string} token - Raw JWT token
   * @returns {boolean} True if revoked
   */
  isRevoked(token) {
    if (!token) return true;
    const tokenKey = this.hashToken(token);
    const expiryMs = this.revokedTokens.get(tokenKey);

    if (!expiryMs) return false;

    // If past expiration, remove from set and return false
    if (Date.now() > expiryMs) {
      this.revokedTokens.delete(tokenKey);
      return false;
    }

    return true;
  }

  /**
   * Purge expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, expiryMs] of this.revokedTokens.entries()) {
      if (now > expiryMs) {
        this.revokedTokens.delete(key);
      }
    }
  }
}

module.exports = new TokenRevocationRegistry();
