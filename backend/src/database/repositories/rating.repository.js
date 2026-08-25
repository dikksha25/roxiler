const BaseRepository = require('./base.repository');

class RatingRepository extends BaseRepository {
  constructor() {
    super('ratings');
  }

  async findByUserAndStore(userId, storeId) {
    const res = await this.query(
      'SELECT id, user_id, store_id, rating, comment, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    return res.rows[0] || null;
  }

  async upsert({ userId, storeId, rating, comment = null }) {
    const res = await this.query(
      `INSERT INTO ratings (user_id, store_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         updated_at = NOW()
       RETURNING id, user_id, store_id, rating, comment, created_at, updated_at`,
      [userId, storeId, rating, comment]
    );
    return res.rows[0];
  }

  async findStoreRatingsPaginated(storeId, { limit = 10, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' }) {
    const countRes = await this.query('SELECT COUNT(*) AS total FROM ratings WHERE store_id = $1', [storeId]);
    const total = parseInt(countRes.rows[0].total, 10);

    const safeSortBy = ['rating', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataRes = await this.query(
      `SELECT r.id, r.user_id, r.store_id, r.rating, r.comment, r.created_at, r.updated_at,
              u.name AS user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.${safeSortBy} ${safeSortOrder}
       LIMIT $2 OFFSET $3`,
      [storeId, limit, offset]
    );

    return { items: dataRes.rows, total };
  }

  async findUserRatingsPaginated(userId, { limit = 10, offset = 0 }) {
    const countRes = await this.query('SELECT COUNT(*) AS total FROM ratings WHERE user_id = $1', [userId]);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataRes = await this.query(
      `SELECT r.id, r.user_id, r.store_id, r.rating, r.comment, r.created_at, r.updated_at,
              s.name AS store_name, s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return { items: dataRes.rows, total };
  }
}

module.exports = new RatingRepository();
