/**
 * Parameterized Query Builder Helper
 */
class QueryBuilder {
  /**
   * Build WHERE clause and params array dynamically
   * @param {Array<{ condition: string, value: any }>} conditions
   * @param {number} [startParamIndex=1]
   */
  static buildWhere(conditions = [], startParamIndex = 1) {
    const clauses = [];
    const params = [];
    let paramIndex = startParamIndex;

    for (const item of conditions) {
      if (item && item.value !== undefined && item.value !== null && item.value !== '') {
        clauses.push(item.condition.replace(/\?/g, () => `$${paramIndex++}`));
        params.push(item.value);
      }
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    return { whereClause, params, nextParamIndex: paramIndex };
  }
}

module.exports = QueryBuilder;
