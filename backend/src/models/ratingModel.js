const { query } = require('../config/db');

class RatingModel {
  /**
   * Find rating by user ID and store ID
   */
  static async findByUserAndStore(userId, storeId) {
    const res = await query(
      'SELECT id, user_id, store_id, rating, comment, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    return res.rows[0] || null;
  }

  /**
   * Find ratings for a specific store
   */
  static async findByStoreId(storeId, { limit = 50, offset = 0 } = {}) {
    const res = await query(
      `SELECT r.id, r.user_id, r.store_id, r.rating, r.comment, r.created_at, r.updated_at,
              u.name AS user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [storeId, limit, offset]
    );
    return res.rows;
  }

  /**
   * Submit or update a rating (Upsert)
   */
  static async upsert({ userId, storeId, rating, comment = null }) {
    const res = await query(
      `INSERT INTO ratings (user_id, store_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, store_id, rating, comment, created_at, updated_at`,
      [userId, storeId, rating, comment]
    );
    return res.rows[0];
  }

  /**
   * Count total ratings submitted platform-wide
   */
  static async count() {
    const res = await query('SELECT COUNT(*) AS total FROM ratings');
    return parseInt(res.rows[0].total, 10);
  }
}

module.exports = RatingModel;
