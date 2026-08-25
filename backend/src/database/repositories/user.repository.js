const BaseRepository = require('./base.repository');
const QueryBuilder = require('../queryBuilder');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    if (!email) return null;
    const res = await this.query(
      'SELECT id, name, email, password_hash, address, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  async findUserProfileById(id) {
    const res = await this.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create({ name, email, passwordHash, address, role }) {
    const res = await this.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name, email.toLowerCase().trim(), passwordHash, address || null, role]
    );
    return res.rows[0];
  }

  async updatePassword(userId, passwordHash) {
    const res = await this.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, userId]
    );
    return res.rows[0] || null;
  }

  async updateProfile(userId, { name, address }) {
    const res = await this.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, address, role, updated_at`,
      [name, address, userId]
    );
    return res.rows[0] || null;
  }

  async findPaginated({ search = '', role = null, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    const conditions = [];
    if (role) {
      conditions.push({ condition: 'role = ?', value: role });
    }
    if (search) {
      conditions.push({
        condition: '(name ILIKE ? OR email ILIKE ? OR address ILIKE ?)',
        value: `%${search}%`,
      });
    }

    // Double value for the 3 OR search terms
    let whereClause = '';
    let params = [];

    if (role && search) {
      whereClause = 'WHERE role = $1 AND (name ILIKE $2 OR email ILIKE $2 OR address ILIKE $2)';
      params = [role, `%${search}%`];
    } else if (role) {
      whereClause = 'WHERE role = $1';
      params = [role];
    } else if (search) {
      whereClause = 'WHERE (name ILIKE $1 OR email ILIKE $1 OR address ILIKE $1)';
      params = [`%${search}%`];
    }

    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const countRes = await this.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const safeSortBy = ['name', 'email', 'role', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pIndex = params.length + 1;
    const selectSql = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${pIndex} OFFSET $${pIndex + 1}
    `;

    const dataRes = await this.query(selectSql, [...params, limit, offset]);

    return { items: dataRes.rows, total };
  }
}

module.exports = new UserRepository();
