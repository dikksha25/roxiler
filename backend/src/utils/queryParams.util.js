const PaginationUtil = require('./pagination.util');

/**
 * Request Query Parameters Parser & Sanitizer
 */
class QueryParamsUtil {
  /**
   * Parse common API query parameters (search, filter, sort, pagination)
   * @param {object} query - Express req.query
   * @param {object} [options] - Allowed sort fields, default sort field
   */
  static parse(query = {}, options = {}) {
    const { allowedSortFields = ['created_at', 'name', 'rating'], defaultSortBy = 'created_at' } = options;

    const { page, limit, offset } = PaginationUtil.parse(query);

    // Search query
    const search = query.search ? String(query.search).trim() : '';

    // Sorting
    let sortBy = query.sortBy || defaultSortBy;
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = defaultSortBy;
    }

    const sortOrder = String(query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Filters
    const filters = {};
    if (query.role) filters.role = query.role;
    if (query.ownerId) filters.ownerId = parseInt(query.ownerId, 10);
    if (query.rating) filters.rating = parseInt(query.rating, 10);

    return {
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      offset,
      filters,
    };
  }
}

module.exports = QueryParamsUtil;
