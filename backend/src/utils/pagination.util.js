/**
 * Generate pagination parameters and metadata
 */
class PaginationUtil {
  /**
   * Parse pagination parameters from request query
   */
  static parse(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Build pagination metadata object
   */
  static buildMeta(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

module.exports = PaginationUtil;
