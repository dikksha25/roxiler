const { query } = require('../config/db');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const res = await query(
      'SELECT id, name, email, password_hash, address, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const res = await query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Create a new user
   */
  static async create({ name, email, passwordHash, address, role }) {
    const res = await query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name, email.toLowerCase(), passwordHash, address, role]
    );
    return res.rows[0];
  }

  /**
   * List all users (Admin view)
   */
  static async findAll({ limit = 50, offset = 0, role = null, search = '' }) {
    let sql = 'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR address ILIKE $${params.length})`;
    }

    params.push(limit, offset);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Count users for metrics
   */
  static async count() {
    const res = await query('SELECT COUNT(*) AS total FROM users');
    return parseInt(res.rows[0].total, 10);
  }
}

module.exports = UserModel;
