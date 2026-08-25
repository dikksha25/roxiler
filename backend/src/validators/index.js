const authValidator = require('./auth.validator');
const userValidator = require('./user.validator');
const storeValidator = require('./store.validator');
const ratingValidator = require('./rating.validator');

module.exports = {
  ...authValidator,
  ...userValidator,
  ...storeValidator,
  ...ratingValidator,
};
