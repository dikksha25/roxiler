/**
 * Standard System Response Messages
 */
const MESSAGES = Object.freeze({
  // Auth
  AUTH_SUCCESS: 'Authentication successful',
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_UPDATED: 'Password updated successfully',
  UNAUTHORIZED: 'Authentication required. Please provide a valid token.',
  FORBIDDEN: 'Access denied. You do not have permission for this resource.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'An account with this email address already exists',
  
  // Store
  STORE_CREATED: 'Store created successfully',
  STORE_UPDATED: 'Store updated successfully',
  STORE_DELETED: 'Store deleted successfully',
  STORE_NOT_FOUND: 'Store not found',
  STORES_RETRIEVED: 'Stores retrieved successfully',
  
  // Rating
  RATING_SUBMITTED: 'Rating submitted successfully',
  RATING_UPDATED: 'Rating updated successfully',
  RATING_DELETED: 'Rating deleted successfully',
  RATINGS_RETRIEVED: 'Ratings retrieved successfully',
  
  // Users
  USERS_RETRIEVED: 'Users retrieved successfully',
  USER_NOT_FOUND: 'User not found',
  USER_UPDATED: 'User updated successfully',
  
  // System / General
  SUCCESS: 'Operation completed successfully',
  VALIDATION_ERROR: 'Validation failed for request parameters',
  NOT_FOUND: 'The requested resource was not found',
  INTERNAL_ERROR: 'An unexpected internal server error occurred',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
});

module.exports = MESSAGES;
