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
    try {
      const res = await this.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
      return res.rows[0] || null;
    } catch (err) {
      if (this.inMemoryStores) {
        return this.inMemoryStores.find((s) => s.id === parseInt(id, 10)) || null;
      }
      if (this.inMemoryUsers) {
        return this.inMemoryUsers.find((u) => u.id === parseInt(id, 10)) || null;
      }
      if (this.inMemoryRatings) {
        return this.inMemoryRatings.find((r) => r.id === parseInt(id, 10)) || null;
      }
      return null;
    }
  }

  async count() {
    try {
      const res = await this.query(`SELECT COUNT(*) AS total FROM ${this.tableName}`);
      return parseInt(res.rows[0].total, 10);
    } catch (err) {
      if (this.inMemoryStores) return this.inMemoryStores.length;
      if (this.inMemoryUsers) return this.inMemoryUsers.length;
      if (this.inMemoryRatings) return this.inMemoryRatings.length;
      return 0;
    }
  }

  async deleteById(id) {
    try {
      const res = await this.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`, [id]);
      return res.rows[0] || null;
    } catch (err) {
      return { id };
    }
  }
}

module.exports = BaseRepository;
