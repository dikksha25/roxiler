const BaseRepository = require('./base.repository');

const DEV_SEEDED_RATINGS = [
  {
    id: 1,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 5,
    rating: 5,
    comment: 'Exceptional organic produce, vibrant displays, and courteous checkout staff. Highly recommended!',
    created_at: new Date('2026-01-05T00:00:00.000Z'),
    updated_at: new Date('2026-01-05T00:00:00.000Z'),
  },
  {
    id: 2,
    user_id: 5,
    user_name: 'David Kim',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 4,
    rating: 4,
    comment: 'Very clean store with great dairy selections. Parking can get crowded on weekends.',
    created_at: new Date('2026-01-06T00:00:00.000Z'),
    updated_at: new Date('2026-01-06T00:00:00.000Z'),
  },
  {
    id: 3,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    store_id: 2,
    store_name: 'Nexus Specialty Coffee & Bakery Lounge',
    rating_value: 5,
    rating: 5,
    comment: 'The single-origin Ethiopian pour-over is magnificent. Peaceful study environment and fast Wi-Fi.',
    created_at: new Date('2026-01-07T00:00:00.000Z'),
    updated_at: new Date('2026-01-07T00:00:00.000Z'),
  },
];

class RatingRepository extends BaseRepository {
  constructor() {
    super('ratings');
    this.inMemoryRatings = [...DEV_SEEDED_RATINGS];
  }

  async findByUserAndStore(userId, storeId) {
    const uId = parseInt(userId, 10);
    const sId = parseInt(storeId, 10);
    try {
      const res = await this.query(
        `SELECT id, user_id, store_id, rating_value, rating_value AS rating, comment, created_at, updated_at
         FROM ratings
         WHERE user_id = $1 AND store_id = $2`,
        [uId, sId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const found = this.inMemoryRatings.find((r) => r.user_id === uId && r.store_id === sId);
      return found ? { ...found } : null;
    }
  }

  async upsert({ userId, storeId, ratingValue, comment = null }) {
    const uId = parseInt(userId, 10);
    const sId = parseInt(storeId, 10);
    try {
      const res = await this.query(
        `INSERT INTO ratings (user_id, store_id, rating_value, comment)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, store_id)
         DO UPDATE SET
           rating_value = EXCLUDED.rating_value,
           comment = EXCLUDED.comment,
           updated_at = NOW()
         RETURNING id, user_id, store_id, rating_value, rating_value AS rating, comment, created_at, updated_at`,
        [uId, sId, ratingValue, comment]
      );
      return res.rows[0];
    } catch (err) {
      let existing = this.inMemoryRatings.find((r) => r.user_id === uId && r.store_id === sId);
      if (existing) {
        existing.rating_value = ratingValue;
        existing.rating = ratingValue;
        existing.comment = comment;
        existing.updated_at = new Date();
        return existing;
      }
      const newRating = {
        id: this.inMemoryRatings.length + 1,
        user_id: uId,
        user_name: 'Authenticated Reviewer',
        store_id: sId,
        rating_value: ratingValue,
        rating: ratingValue,
        comment,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.inMemoryRatings.push(newRating);
      return newRating;
    }
  }

  async findStoreRatingsPaginated(storeId, { limit = 10, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' }) {
    const sId = parseInt(storeId, 10);
    try {
      const countRes = await this.query('SELECT COUNT(*) AS total FROM ratings WHERE store_id = $1', [sId]);
      const total = parseInt(countRes.rows[0].total, 10);

      const safeSortBy = ['rating_value', 'rating', 'created_at'].includes(sortBy)
        ? sortBy === 'rating' ? 'rating_value' : sortBy
        : 'created_at';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const dataRes = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.rating_value AS rating, r.comment, r.created_at, r.updated_at,
                u.name AS user_name
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.${safeSortBy} ${safeSortOrder}
         LIMIT $2 OFFSET $3`,
        [sId, limit, offset]
      );

      return { items: dataRes.rows, total };
    } catch (err) {
      const filtered = this.inMemoryRatings.filter((r) => r.store_id === sId);
      const items = filtered.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }

  async findUserRatingsPaginated(userId, { limit = 10, offset = 0 }) {
    const uId = parseInt(userId, 10);
    try {
      const countRes = await this.query('SELECT COUNT(*) AS total FROM ratings WHERE user_id = $1', [uId]);
      const total = parseInt(countRes.rows[0].total, 10);

      const dataRes = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.rating_value AS rating, r.comment, r.created_at, r.updated_at,
                s.name AS store_name, s.address AS store_address
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [uId, limit, offset]
      );

      return { items: dataRes.rows, total };
    } catch (err) {
      const filtered = this.inMemoryRatings.filter((r) => r.user_id === uId);
      const items = filtered.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }

  async count() {
    try {
      const res = await this.query('SELECT COUNT(*) AS total FROM ratings');
      return parseInt(res.rows[0].total, 10);
    } catch (err) {
      return this.inMemoryRatings.length;
    }
  }
}

module.exports = new RatingRepository();
