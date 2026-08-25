const { query } = require('../connection');

/**
 * Base Repository
 */
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.query = query;
  }

  async findById(id) {
    const res = await this.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async count() {
    const res = await this.query(`SELECT COUNT(*) AS total FROM ${this.tableName}`);
    return parseInt(res.rows[0].total, 10);
  }

  async deleteById(id) {
    const res = await this.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`, [id]);
    return res.rows[0] || null;
  }
}

module.exports = BaseRepository;
