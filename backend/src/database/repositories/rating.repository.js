const BaseRepository = require('./base.repository');

const DEV_SEEDED_RATINGS = [
  {
    id: 1,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 5,
    comment: 'Exceptional fresh organic produce and friendly staff!',
    created_at: new Date('2026-01-05T10:00:00.000Z'),
    updated_at: new Date('2026-01-05T10:00:00.000Z'),
  },
  {
    id: 2,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    store_id: 2,
    store_name: 'Nexus Specialty Coffee & Bakery Lounge',
    rating_value: 5,
    comment: 'Best pour-over coffee in the city.',
    created_at: new Date('2026-01-06T11:00:00.000Z'),
    updated_at: new Date('2026-01-06T11:00:00.000Z'),
  },
  {
    id: 3,
    user_id: 5,
    user_name: 'David Kim',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 4,
    comment: 'Great selection, parking can get busy during peak hours.',
    created_at: new Date('2026-01-07T12:00:00.000Z'),
    updated_at: new Date('2026-01-07T12:00:00.000Z'),
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
        `SELECT id, user_id, store_id, rating_value, comment, created_at, updated_at
         FROM ratings
         WHERE user_id = $1 AND store_id = $2`,
        [uId, sId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const found = this.inMemoryRatings.find(
        (r) => r.user_id === uId && r.store_id === sId
      );
      return found ? { ...found } : null;
    }
  }

  async create({ userId, storeId, ratingValue, comment }) {
    const uId = parseInt(userId, 10);
    const sId = parseInt(storeId, 10);
    const val = parseInt(ratingValue, 10);

    try {
      const res = await this.query(
        `INSERT INTO ratings (user_id, store_id, rating_value, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, store_id, rating_value, comment, created_at, updated_at`,
        [uId, sId, val, comment || null]
      );
      return res.rows[0];
    } catch (err) {
      const newRating = {
        id: this.inMemoryRatings.length + 1,
        user_id: uId,
        store_id: sId,
        rating_value: val,
        comment: comment || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.inMemoryRatings.push(newRating);
      return newRating;
    }
  }

  async updateByUserAndStore(userId, storeId, { ratingValue, comment }) {
    const uId = parseInt(userId, 10);
    const sId = parseInt(storeId, 10);
    const val = parseInt(ratingValue, 10);

    try {
      const res = await this.query(
        `UPDATE ratings
         SET rating_value = COALESCE($1, rating_value),
             comment = COALESCE($2, comment),
             updated_at = NOW()
         WHERE user_id = $3 AND store_id = $4
         RETURNING id, user_id, store_id, rating_value, comment, created_at, updated_at`,
        [val, comment !== undefined ? comment : null, uId, sId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const existing = this.inMemoryRatings.find(
        (r) => r.user_id === uId && r.store_id === sId
      );
      if (existing) {
        existing.rating_value = val;
        if (comment !== undefined) existing.comment = comment;
        existing.updated_at = new Date();
        return { ...existing };
      }
      return null;
    }
  }

  async update(id, { ratingValue, comment }) {
    const rId = parseInt(id, 10);
    const val = ratingValue !== undefined ? parseInt(ratingValue, 10) : null;

    try {
      const res = await this.query(
        `UPDATE ratings
         SET rating_value = COALESCE($1, rating_value),
             comment = COALESCE($2, comment),
             updated_at = NOW()
         WHERE id = $3
         RETURNING id, user_id, store_id, rating_value, comment, updated_at`,
        [val, comment !== undefined ? comment : null, rId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const existing = this.inMemoryRatings.find((r) => r.id === rId);
      if (existing) {
        if (val !== null) existing.rating_value = val;
        if (comment !== undefined) existing.comment = comment;
        existing.updated_at = new Date();
        return { ...existing };
      }
      return null;
    }
  }

  async findByStoreId(storeId) {
    const sId = parseInt(storeId, 10);
    try {
      const res = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.comment, r.created_at, r.updated_at,
                u.name AS user_name, u.email AS user_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [sId]
      );
      return res.rows;
    } catch (err) {
      return this.inMemoryRatings.filter((r) => r.store_id === sId);
    }
  }

  async findByUserId(userId) {
    const uId = parseInt(userId, 10);
    try {
      const res = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.comment, r.created_at, r.updated_at,
                s.name AS store_name, s.address AS store_address
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [uId]
      );
      return res.rows;
    } catch (err) {
      return this.inMemoryRatings.filter((r) => r.user_id === uId);
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
