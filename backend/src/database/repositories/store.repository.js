const BaseRepository = require('./base.repository');

const DEV_SEEDED_STORES = [
  {
    id: 1,
    name: 'FreshMart Supermarket & Organics',
    email: 'contact@freshmart.com',
    address: '452 Marketplace Blvd, Downtown Plaza',
    owner_id: 2,
    owner_name: 'Marcus Vance',
    owner_email: 'owner.marcus@freshmart.com',
    average_rating: '4.80',
    rating_count: 4,
    created_at: new Date('2026-01-02T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    id: 2,
    name: 'Nexus Specialty Coffee & Bakery Lounge',
    email: 'hello@nexuscoffee.com',
    address: '88 Artisan Alley, Heritage Square',
    owner_id: 3,
    owner_name: 'Elena Rostova',
    owner_email: 'owner.elena@nexuscoffee.com',
    average_rating: '4.90',
    rating_count: 3,
    created_at: new Date('2026-01-03T00:00:00.000Z'),
    updated_at: new Date('2026-01-03T00:00:00.000Z'),
  },
  {
    id: 3,
    name: 'Apex Electronics & Smart Devices',
    email: 'support@apexelectronics.com',
    address: '108 Silicon Avenue, Innovation District',
    owner_id: 2,
    owner_name: 'Marcus Vance',
    owner_email: 'owner.marcus@freshmart.com',
    average_rating: '4.50',
    rating_count: 3,
    created_at: new Date('2026-01-04T00:00:00.000Z'),
    updated_at: new Date('2026-01-04T00:00:00.000Z'),
  },
];

class StoreRepository extends BaseRepository {
  constructor() {
    super('stores');
    this.inMemoryStores = [...DEV_SEEDED_STORES];
  }

  async findDetailById(id) {
    const storeId = parseInt(id, 10);
    try {
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
        [storeId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const found = this.inMemoryStores.find((s) => s.id === storeId);
      return found ? { ...found } : null;
    }
  }

  async findByOwnerId(ownerId) {
    const oId = parseInt(ownerId, 10);
    try {
      const res = await this.query(
        `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
                COUNT(r.id)::int AS rating_count
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id
         ORDER BY s.created_at DESC`,
        [oId]
      );
      return res.rows;
    } catch (err) {
      return this.inMemoryStores.filter((s) => s.owner_id === oId);
    }
  }

  async create({ name, email, address, ownerId }) {
    try {
      const res = await this.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, address, owner_id, created_at, updated_at`,
        [name, email.toLowerCase().trim(), address, ownerId || null]
      );
      return res.rows[0];
    } catch (err) {
      const newStore = {
        id: this.inMemoryStores.length + 1,
        name,
        email: email.toLowerCase().trim(),
        address,
        owner_id: ownerId || null,
        average_rating: '0.00',
        rating_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.inMemoryStores.push(newStore);
      return newStore;
    }
  }

  async update(id, { name, email, address, ownerId }) {
    const storeId = parseInt(id, 10);
    try {
      const res = await this.query(
        `UPDATE stores
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             address = COALESCE($3, address),
             owner_id = COALESCE($4, owner_id),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, name, email, address, owner_id, updated_at`,
        [name, email, address, ownerId, storeId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const store = this.inMemoryStores.find((s) => s.id === storeId);
      if (store) {
        if (name) store.name = name;
        if (email) store.email = email;
        if (address) store.address = address;
        if (ownerId) store.owner_id = ownerId;
        store.updated_at = new Date();
        return store;
      }
      return null;
    }
  }

  async findPaginated({ search = '', ownerId = null, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    try {
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
    } catch (err) {
      let filtered = [...this.inMemoryStores];
      if (ownerId) filtered = filtered.filter((s) => s.owner_id === parseInt(ownerId, 10));
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((st) => st.name.toLowerCase().includes(s) || st.address.toLowerCase().includes(s));
      }
      const items = filtered.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }

  async count() {
    try {
      const res = await this.query('SELECT COUNT(*) AS total FROM stores');
      return parseInt(res.rows[0].total, 10);
    } catch (err) {
      return this.inMemoryStores.length;
    }
  }
}

module.exports = new StoreRepository();
