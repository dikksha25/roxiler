const { query } = require('../config/db');

class StoreModel {
  /**
   * Find store by ID with owner details and aggregated average rating
   */
  static async findById(id) {
    const res = await query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
              u.name AS owner_name, u.email AS owner_email,
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.00) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id, u.name, u.email`,
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Find stores owned by a specific store owner user
   */
  static async findByOwnerId(ownerId) {
    const res = await query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.00) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [ownerId]
    );
    return res.rows;
  }

  /**
   * List all stores with average ratings and search filter
   */
  static async findAll({ search = '', limit = 50, offset = 0 }) {
    let sql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             u.name AS owner_name,
             COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.00) AS average_rating,
             COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (s.name ILIKE $${params.length} OR s.address ILIKE $${params.length})`;
    }

    sql += ` GROUP BY s.id, u.name ORDER BY s.created_at DESC`;
    params.push(limit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Create a new store
   */
  static async create({ name, email, address, ownerId }) {
    const res = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at, updated_at`,
      [name, email, address, ownerId || null]
    );
    return res.rows[0];
  }

  /**
   * Count total stores
   */
  static async count() {
    const res = await query('SELECT COUNT(*) AS total FROM stores');
    return parseInt(res.rows[0].total, 10);
  }
}

module.exports = StoreModel;
