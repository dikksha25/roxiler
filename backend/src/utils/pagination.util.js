class PaginationUtil {
  static parse(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  }

  static getOffset(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    return (pageNum - 1) * limitNum;
  }

  static buildMeta(totalItems, page = 1, limit = 10) {
    const total = Math.max(0, parseInt(totalItems, 10) || 0);
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      totalItems: total,
      totalPages,
      currentPage,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }
}

module.exports = PaginationUtil;
