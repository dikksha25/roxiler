const { validationResult } = require('express-validator');
const ValidationError = require('../errors/validation.error');

/**
 * Request Validation Middleware Runner
 * @param {Array} validations - Array of express-validator chains
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel/sequence
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    next(new ValidationError('Validation failed for one or more request fields', formattedErrors));
  };
};

module.exports = validate;
