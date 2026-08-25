const BaseRepository = require('./base.repository');

class StoreRepository extends BaseRepository {
  constructor() {
    super('stores');
  }

  async findDetailById(id) {
    const res = await this.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
              u.name AS owner_name, u.email AS owner_email,
              COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
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

  async findByOwnerId(ownerId) {
    const res = await this.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
              COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
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

  async create({ name, email, address, ownerId }) {
    const res = await this.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at, updated_at`,
      [name, email.toLowerCase().trim(), address, ownerId || null]
    );
    return res.rows[0];
  }

  async update(id, { name, email, address, ownerId }) {
    const res = await this.query(
      `UPDATE stores
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           address = COALESCE($3, address),
           owner_id = COALESCE($4, owner_id),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, address, owner_id, updated_at`,
      [name, email, address, ownerId, id]
    );
    return res.rows[0] || null;
  }

  async findPaginated({ search = '', ownerId = null, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (ownerId) {
      params.push(ownerId);
      whereClause += ` AND s.owner_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (s.name ILIKE $${params.length} OR s.address ILIKE $${params.length})`;
    }

    const countSql = `SELECT COUNT(*) AS total FROM stores s ${whereClause}`;
    const countRes = await this.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const safeSortBy = ['name', 'created_at', 'average_rating'].includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pIndex = params.length + 1;
    const selectSql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             u.name AS owner_name,
             COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
             COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, u.name
      ORDER BY ${safeSortBy === 'average_rating' ? 'average_rating' : `s.${safeSortBy}`} ${safeSortOrder}
      LIMIT $${pIndex} OFFSET $${pIndex + 1}
    `;

    const dataRes = await this.query(selectSql, [...params, limit, offset]);

    return { items: dataRes.rows, total };
  }
}

module.exports = new StoreRepository();
