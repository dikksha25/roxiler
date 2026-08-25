const BaseRepository = require('./base.repository');
const ratingRepository = require('./rating.repository');

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
    overall_rating: '4.80',
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
    overall_rating: '4.90',
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
    overall_rating: '4.50',
    rating_count: 3,
    created_at: new Date('2026-01-04T00:00:00.000Z'),
    updated_at: new Date('2026-01-04T00:00:00.000Z'),
  },
];

const STORE_SORT_ALLOWLIST = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'average_rating',
  average_rating: 'average_rating',
  overall_rating: 'average_rating',
  user_rating: 'my_r.rating_value',
  my_rating: 'my_r.rating_value',
  created_at: 's.created_at',
};

const USER_BROWSE_SORT_ALLOWLIST = {
  name: 's.name',
  address: 's.address',
  rating: 'overall_rating',
  average_rating: 'overall_rating',
  overall_rating: 'overall_rating',
  user_rating: 'my_r.rating_value',
  my_rating: 'my_r.rating_value',
  created_at: 's.created_at',
};

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
                COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS overall_rating,
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
      if (!found) return null;

      const storeRatings = ratingRepository.inMemoryRatings.filter((r) => r.store_id === storeId);
      const avg = storeRatings.length > 0
        ? (storeRatings.reduce((acc, r) => acc + r.rating_value, 0) / storeRatings.length).toFixed(2)
        : found.average_rating || '0.00';

      return {
        ...found,
        average_rating: avg,
        overall_rating: avg,
        rating_count: storeRatings.length,
      };
    }
  }

  async findByOwnerId(ownerId) {
    const oId = parseInt(ownerId, 10);
    try {
      const res = await this.query(
        `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
                COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS overall_rating,
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

  async create({ name, email, address, ownerId, owner_name = null, owner_email = null }) {
    try {
      const res = await this.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, address, owner_id, created_at, updated_at`,
        [name.trim(), email.toLowerCase().trim(), address.trim(), ownerId || null]
      );
      return {
        ...res.rows[0],
        owner_name,
        owner_email,
        average_rating: '0.00',
        overall_rating: '0.00',
        rating_count: 0,
      };
    } catch (err) {
      const newStore = {
        id: this.inMemoryStores.length + 1,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        owner_id: ownerId || null,
        owner_name: owner_name || null,
        owner_email: owner_email || null,
        average_rating: '0.00',
        overall_rating: '0.00',
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
        [name ? name.trim() : null, email ? email.trim() : null, address ? address.trim() : null, ownerId, storeId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const store = this.inMemoryStores.find((s) => s.id === storeId);
      if (store) {
        if (name) store.name = name.trim();
        if (email) store.email = email.trim();
        if (address) store.address = address.trim();
        if (ownerId !== undefined) store.owner_id = ownerId;
        store.updated_at = new Date();
        return store;
      }
      return null;
    }
  }

  /**
   * General store list with dynamic overall rating calculations
   */
  async findPaginated({
    search = '',
    ownerId = null,
    name = '',
    email = '',
    address = '',
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 10,
    offset = 0,
  }) {
    const safeSortExpression = STORE_SORT_ALLOWLIST[sortBy] || 's.created_at';
    const safeSortOrder = sortOrder && sortOrder.toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
      let whereClauses = ['1=1'];
      const params = [];

      if (ownerId) {
        params.push(ownerId);
        whereClauses.push(`s.owner_id = $${params.length}`);
      }

      if (name) {
        params.push(`%${name.trim()}%`);
        whereClauses.push(`s.name ILIKE $${params.length}`);
      }

      if (email) {
        params.push(`%${email.trim()}%`);
        whereClauses.push(`s.email ILIKE $${params.length}`);
      }

      if (address) {
        params.push(`%${address.trim()}%`);
        whereClauses.push(`s.address ILIKE $${params.length}`);
      }

      if (search) {
        params.push(`%${search.trim()}%`);
        const pIdx = params.length;
        whereClauses.push(`(s.name ILIKE $${pIdx} OR s.email ILIKE $${pIdx} OR s.address ILIKE $${pIdx})`);
      }

      const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

      const countSql = `SELECT COUNT(*) AS total FROM stores s ${whereSql}`;
      const countRes = await this.query(countSql, params);
      const total = parseInt(countRes.rows[0].total, 10);

      const pIndex = params.length + 1;
      const selectSql = `
        SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
               u.name AS owner_name, u.email AS owner_email,
               COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
               COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS overall_rating,
               COUNT(r.id)::int AS rating_count
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        LEFT JOIN ratings r ON s.id = r.store_id
        ${whereSql}
        GROUP BY s.id, u.name, u.email
        ORDER BY ${safeSortExpression} ${safeSortOrder}
        LIMIT $${pIndex} OFFSET $${pIndex + 1}
      `;

      const dataRes = await this.query(selectSql, [...params, limit, offset]);
      return { items: dataRes.rows, total };
    } catch (err) {
      let filtered = this.inMemoryStores.map((store) => {
        const storeRatings = ratingRepository.inMemoryRatings.filter((r) => r.store_id === store.id);
        const avg = storeRatings.length > 0
          ? (storeRatings.reduce((acc, r) => acc + r.rating_value, 0) / storeRatings.length).toFixed(2)
          : store.average_rating || '0.00';

        return {
          ...store,
          average_rating: avg,
          overall_rating: avg,
          rating_count: storeRatings.length,
        };
      });

      if (ownerId) {
        filtered = filtered.filter((s) => s.owner_id === parseInt(ownerId, 10));
      }
      if (name) {
        filtered = filtered.filter((s) => s.name.toLowerCase().includes(name.trim().toLowerCase()));
      }
      if (email) {
        filtered = filtered.filter((s) => s.email.toLowerCase().includes(email.trim().toLowerCase()));
      }
      if (address) {
        filtered = filtered.filter((s) => s.address.toLowerCase().includes(address.trim().toLowerCase()));
      }
      if (search) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (st) =>
            st.name.toLowerCase().includes(s) ||
            st.email.toLowerCase().includes(s) ||
            st.address.toLowerCase().includes(s)
        );
      }

      const isAsc = safeSortOrder === 'ASC';
      const keyName = ['name', 'email', 'address', 'rating', 'average_rating', 'created_at'].includes(sortBy)
        ? sortBy
        : 'created_at';

      filtered.sort((a, b) => {
        let valA = a[keyName] || '';
        let valB = b[keyName] || '';
        if (keyName === 'rating' || keyName === 'average_rating' || keyName === 'overall_rating') {
          valA = parseFloat(a.average_rating || 0);
          valB = parseFloat(b.average_rating || 0);
        } else if (keyName === 'created_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });

      const items = filtered.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }

  /**
   * Protected store list for authenticated NORMAL_USER
   * Resolves overall_rating AND the authenticated user's own submitted rating (user_rating / my_rating)
   */
  async findPaginatedForUser(userId, {
    search = '',
    name = '',
    address = '',
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 10,
    offset = 0,
  }) {
    const currentUserId = parseInt(userId, 10);
    const safeSortExpression = USER_BROWSE_SORT_ALLOWLIST[sortBy] || 's.created_at';
    const safeSortOrder = sortOrder && sortOrder.toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
      let whereClauses = ['1=1'];
      const params = [currentUserId];

      if (name) {
        params.push(`%${name.trim()}%`);
        whereClauses.push(`s.name ILIKE $${params.length}`);
      }

      if (address) {
        params.push(`%${address.trim()}%`);
        whereClauses.push(`s.address ILIKE $${params.length}`);
      }

      if (search) {
        params.push(`%${search.trim()}%`);
        const pIdx = params.length;
        whereClauses.push(`(s.name ILIKE $${pIdx} OR s.address ILIKE $${pIdx})`);
      }

      const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

      const countSql = `SELECT COUNT(*) AS total FROM stores s ${whereSql}`;
      const countRes = await this.query(countSql, params);
      const total = parseInt(countRes.rows[0].total, 10);

      const limitIdx = params.length + 1;
      const offsetIdx = params.length + 2;

      const selectSql = `
        SELECT s.id, s.name, s.email, s.address, s.created_at, s.updated_at,
               COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS overall_rating,
               COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
               COUNT(r.id)::int AS rating_count,
               my_r.rating_value AS user_rating,
               my_r.rating_value AS my_rating,
               my_r.comment AS my_comment,
               my_r.updated_at AS my_rating_updated_at
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        LEFT JOIN ratings my_r ON s.id = my_r.store_id AND my_r.user_id = $1
        ${whereSql}
        GROUP BY s.id, my_r.rating_value, my_r.comment, my_r.updated_at
        ORDER BY ${safeSortExpression} ${safeSortOrder}
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;

      const dataRes = await this.query(selectSql, [...params, limit, offset]);
      return { items: dataRes.rows, total };
    } catch (err) {
      let filtered = this.inMemoryStores.map((store) => {
        const storeRatings = ratingRepository.inMemoryRatings.filter((r) => r.store_id === store.id);
        const userRatingRecord = ratingRepository.inMemoryRatings.find(
          (r) => r.store_id === store.id && r.user_id === currentUserId
        );

        const avg = storeRatings.length > 0
          ? (storeRatings.reduce((acc, r) => acc + r.rating_value, 0) / storeRatings.length).toFixed(2)
          : store.average_rating || '0.00';

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          created_at: store.created_at,
          updated_at: store.updated_at,
          overall_rating: avg,
          average_rating: avg,
          rating_count: storeRatings.length,
          user_rating: userRatingRecord ? userRatingRecord.rating_value : null,
          my_rating: userRatingRecord ? userRatingRecord.rating_value : null,
          my_comment: userRatingRecord ? userRatingRecord.comment : null,
        };
      });

      if (name) {
        filtered = filtered.filter((s) => s.name.toLowerCase().includes(name.trim().toLowerCase()));
      }
      if (address) {
        filtered = filtered.filter((s) => s.address.toLowerCase().includes(address.trim().toLowerCase()));
      }
      if (search) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (st) =>
            st.name.toLowerCase().includes(s) ||
            st.address.toLowerCase().includes(s)
        );
      }

      const isAsc = safeSortOrder === 'ASC';
      const keyName = ['name', 'address', 'rating', 'average_rating', 'overall_rating', 'user_rating', 'my_rating', 'created_at'].includes(sortBy)
        ? sortBy
        : 'created_at';

      filtered.sort((a, b) => {
        let valA = a[keyName] || '';
        let valB = b[keyName] || '';
        if (keyName === 'rating' || keyName === 'average_rating' || keyName === 'overall_rating') {
          valA = parseFloat(a.overall_rating || 0);
          valB = parseFloat(b.overall_rating || 0);
        } else if (keyName === 'user_rating' || keyName === 'my_rating') {
          valA = a.user_rating !== null ? a.user_rating : -1;
          valB = b.user_rating !== null ? b.user_rating : -1;
        } else if (keyName === 'created_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });

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
