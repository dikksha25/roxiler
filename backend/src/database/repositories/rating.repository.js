const BaseRepository = require('./base.repository');

const DEV_SEEDED_RATINGS = [
  {
    id: 1,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    user_email: 'sarah.jenkins@example.com',
    user_address: '742 Evergreen Terrace, Sector 4, Springfield',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 5,
    comment: 'Exceptional fresh organic produce and friendly staff!',
    owner_reply: 'Thank you so much Sarah! Our team works diligently to stock farm-fresh organics daily.',
    owner_replied_at: new Date('2026-01-06T10:00:00.000Z'),
    created_at: new Date('2026-01-05T10:00:00.000Z'),
    updated_at: new Date('2026-01-06T10:00:00.000Z'),
  },
  {
    id: 2,
    user_id: 4,
    user_name: 'Sarah Jenkins',
    user_email: 'sarah.jenkins@example.com',
    user_address: '742 Evergreen Terrace, Sector 4, Springfield',
    store_id: 2,
    store_name: 'Nexus Specialty Coffee & Bakery Lounge',
    rating_value: 5,
    comment: 'Best pour-over coffee in the city.',
    owner_reply: 'Appreciate the kind words! Glad you enjoyed our single-origin roast.',
    owner_replied_at: new Date('2026-01-07T11:00:00.000Z'),
    created_at: new Date('2026-01-06T11:00:00.000Z'),
    updated_at: new Date('2026-01-07T11:00:00.000Z'),
  },
  {
    id: 3,
    user_id: 5,
    user_name: 'David Kim',
    user_email: 'david.kim@example.com',
    user_address: '1208 Elmwood Park Lane, Greenfield Hills',
    store_id: 1,
    store_name: 'FreshMart Supermarket & Organics',
    rating_value: 4,
    comment: 'Great selection, parking can get busy during peak hours.',
    owner_reply: 'Thanks for visiting David! We are currently expanding our weekend parking spots.',
    owner_replied_at: new Date('2026-01-08T12:00:00.000Z'),
    created_at: new Date('2026-01-07T12:00:00.000Z'),
    updated_at: new Date('2026-01-08T12:00:00.000Z'),
  },
];

const OWNER_RATING_SORT_ALLOWLIST = {
  name: 'u.name',
  user_name: 'u.name',
  email: 'u.email',
  user_email: 'u.email',
  address: 'u.address',
  user_address: 'u.address',
  rating: 'r.rating_value',
  rating_value: 'r.rating_value',
  date: 'r.created_at',
  created_at: 'r.created_at',
};

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
        `SELECT id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, created_at, updated_at
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
         RETURNING id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, created_at, updated_at`,
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
        owner_reply: null,
        owner_replied_at: null,
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
         RETURNING id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, created_at, updated_at`,
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
         RETURNING id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, updated_at`,
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

  /**
   * Save store owner's response reply to a specific customer review
   */
  async replyToRating(ratingId, replyText) {
    const rId = parseInt(ratingId, 10);
    const text = replyText ? replyText.trim() : null;

    try {
      const res = await this.query(
        `UPDATE ratings
         SET owner_reply = $1,
             owner_replied_at = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, created_at, updated_at`,
        [text, rId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const existing = this.inMemoryRatings.find((r) => r.id === rId);
      if (existing) {
        existing.owner_reply = text;
        existing.owner_replied_at = new Date();
        existing.updated_at = new Date();
        return { ...existing };
      }
      return null;
    }
  }

  /**
   * Dedicated paginated query for STORE_OWNER to view all ratings received by their stores
   */
  async findPaginatedForOwner(ownerId, {
    search = '',
    name = '',
    email = '',
    address = '',
    rating = null,
    storeId = null,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 10,
    offset = 0,
  }) {
    const oId = parseInt(ownerId, 10);
    const safeSortExpression = OWNER_RATING_SORT_ALLOWLIST[sortBy] || 'r.created_at';
    const safeSortOrder = sortOrder && sortOrder.toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
      let whereClauses = ['s.owner_id = $1'];
      const params = [oId];

      if (storeId) {
        params.push(parseInt(storeId, 10));
        whereClauses.push(`r.store_id = $${params.length}`);
      }

      if (rating) {
        params.push(parseInt(rating, 10));
        whereClauses.push(`r.rating_value = $${params.length}`);
      }

      if (name) {
        params.push(`%${name.trim()}%`);
        whereClauses.push(`u.name ILIKE $${params.length}`);
      }

      if (email) {
        params.push(`%${email.trim()}%`);
        whereClauses.push(`u.email ILIKE $${params.length}`);
      }

      if (address) {
        params.push(`%${address.trim()}%`);
        whereClauses.push(`u.address ILIKE $${params.length}`);
      }

      if (search) {
        params.push(`%${search.trim()}%`);
        const pIdx = params.length;
        whereClauses.push(`(u.name ILIKE $${pIdx} OR u.email ILIKE $${pIdx} OR u.address ILIKE $${pIdx} OR s.name ILIKE $${pIdx})`);
      }

      const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

      const countSql = `
        SELECT COUNT(r.id)::int AS total
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        JOIN users u ON r.user_id = u.id
        ${whereSql}
      `;
      const countRes = await this.query(countSql, params);
      const total = parseInt(countRes.rows[0].total, 10);

      const limitIdx = params.length + 1;
      const offsetIdx = params.length + 2;

      const selectSql = `
        SELECT r.id, r.rating_value, r.comment, r.owner_reply, r.owner_replied_at, r.created_at, r.updated_at,
               r.store_id, s.name AS store_name, s.address AS store_address,
               u.id AS user_id, u.name AS user_name, u.email AS user_email, u.address AS user_address
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        JOIN users u ON r.user_id = u.id
        ${whereSql}
        ORDER BY ${safeSortExpression} ${safeSortOrder}
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;

      const dataRes = await this.query(selectSql, [...params, limit, offset]);

      const items = dataRes.rows.map((row) => ({
        id: row.id,
        rating_value: row.rating_value,
        rating: row.rating_value,
        comment: row.comment,
        owner_reply: row.owner_reply,
        owner_replied_at: row.owner_replied_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        store_id: row.store_id,
        store_name: row.store_name,
        store_address: row.store_address,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          address: row.user_address,
        },
      }));

      return { items, total };
    } catch (err) {
      const storeRepository = require('./store.repository');
      const userRepository = require('./user.repository');

      const ownerStores = (storeRepository.inMemoryStores || []).filter((s) => s.owner_id === oId);
      const ownerStoreIds = ownerStores.map((s) => s.id);

      let filtered = this.inMemoryRatings.filter((r) => ownerStoreIds.includes(r.store_id));

      if (storeId) {
        filtered = filtered.filter((r) => r.store_id === parseInt(storeId, 10));
      }

      if (rating) {
        filtered = filtered.filter((r) => r.rating_value === parseInt(rating, 10));
      }

      let mapped = filtered.map((r) => {
        const store = ownerStores.find((s) => s.id === r.store_id) || { name: 'Owned Store', address: 'Marketplace' };
        const user = (userRepository.inMemoryUsers || []).find((u) => u.id === r.user_id) || {
          id: r.user_id,
          name: r.user_name || 'Customer User',
          email: r.user_email || 'user@example.com',
          address: r.user_address || 'Springfield',
        };

        return {
          id: r.id,
          rating_value: r.rating_value,
          rating: r.rating_value,
          comment: r.comment,
          owner_reply: r.owner_reply,
          owner_replied_at: r.owner_replied_at,
          created_at: r.created_at,
          updated_at: r.updated_at,
          store_id: r.store_id,
          store_name: store.name,
          store_address: store.address,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
          },
        };
      });

      if (name) {
        const n = name.trim().toLowerCase();
        mapped = mapped.filter((m) => m.user.name.toLowerCase().includes(n));
      }

      if (email) {
        const e = email.trim().toLowerCase();
        mapped = mapped.filter((m) => m.user.email.toLowerCase().includes(e));
      }

      if (address) {
        const a = address.trim().toLowerCase();
        mapped = mapped.filter((m) => (m.user.address || '').toLowerCase().includes(a));
      }

      if (search) {
        const s = search.trim().toLowerCase();
        mapped = mapped.filter(
          (m) =>
            m.user.name.toLowerCase().includes(s) ||
            m.user.email.toLowerCase().includes(s) ||
            (m.user.address || '').toLowerCase().includes(s) ||
            m.store_name.toLowerCase().includes(s)
        );
      }

      const isAsc = safeSortOrder === 'ASC';
      mapped.sort((a, b) => {
        let valA = '';
        let valB = '';

        if (sortBy === 'name' || sortBy === 'user_name') {
          valA = a.user.name.toLowerCase();
          valB = b.user.name.toLowerCase();
        } else if (sortBy === 'email' || sortBy === 'user_email') {
          valA = a.user.email.toLowerCase();
          valB = b.user.email.toLowerCase();
        } else if (sortBy === 'address' || sortBy === 'user_address') {
          valA = (a.user.address || '').toLowerCase();
          valB = (b.user.address || '').toLowerCase();
        } else if (sortBy === 'rating' || sortBy === 'rating_value') {
          valA = a.rating_value;
          valB = b.rating_value;
        } else {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });

      const items = mapped.slice(offset, offset + limit);
      return { items, total: mapped.length };
    }
  }

  /**
   * Find ratings for a store with customer/user details
   */
  async findByStoreIdWithUserDetails(storeId) {
    const sId = parseInt(storeId, 10);
    try {
      const res = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.comment, r.owner_reply, r.owner_replied_at, r.created_at, r.updated_at,
                u.name AS user_name, u.email AS user_email, u.address AS user_address
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [sId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        rating_value: row.rating_value,
        rating: row.rating_value,
        comment: row.comment,
        owner_reply: row.owner_reply,
        owner_replied_at: row.owner_replied_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          address: row.user_address,
        },
      }));
    } catch (err) {
      const userRepository = require('./user.repository');
      const ratings = this.inMemoryRatings.filter((r) => r.store_id === sId);

      return ratings.map((r) => {
        const user = (userRepository.inMemoryUsers || []).find((u) => u.id === r.user_id) || {
          id: r.user_id,
          name: r.user_name || 'Customer User',
          email: r.user_email || 'user@example.com',
          address: r.user_address || 'Springfield',
        };

        return {
          id: r.id,
          rating_value: r.rating_value,
          rating: r.rating_value,
          comment: r.comment,
          owner_reply: r.owner_reply,
          owner_replied_at: r.owner_replied_at,
          created_at: r.created_at,
          updated_at: r.updated_at,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
          },
        };
      });
    }
  }

  async findByStoreId(storeId) {
    return await this.findByStoreIdWithUserDetails(storeId);
  }

  /**
   * Batch query ratings for multiple store IDs in a single SQL operation (N+1 query defense)
   */
  async findByStoreIdsWithUserDetails(storeIds) {
    if (!storeIds || storeIds.length === 0) return {};
    const ids = storeIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    if (ids.length === 0) return {};

    try {
      const res = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.comment, r.owner_reply, r.owner_replied_at, r.created_at, r.updated_at,
                u.name AS user_name, u.email AS user_email, u.address AS user_address
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = ANY($1::bigint[])
         ORDER BY r.created_at DESC`,
        [ids]
      );

      const map = {};
      ids.forEach((id) => { map[id] = []; });

      res.rows.forEach((row) => {
        const entry = {
          id: row.id,
          rating_value: row.rating_value,
          rating: row.rating_value,
          comment: row.comment,
          owner_reply: row.owner_reply,
          owner_replied_at: row.owner_replied_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
          user: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            address: row.user_address,
          },
        };
        if (!map[row.store_id]) map[row.store_id] = [];
        map[row.store_id].push(entry);
      });

      return map;
    } catch (err) {
      const userRepository = require('./user.repository');
      const map = {};
      ids.forEach((id) => {
        const storeRatings = this.inMemoryRatings.filter((r) => r.store_id === id);
        map[id] = storeRatings.map((r) => {
          const user = (userRepository.inMemoryUsers || []).find((u) => u.id === r.user_id) || {
            id: r.user_id,
            name: r.user_name || 'Customer User',
            email: r.user_email || 'user@example.com',
            address: r.user_address || 'Springfield',
          };
          return {
            id: r.id,
            rating_value: r.rating_value,
            rating: r.rating_value,
            comment: r.comment,
            owner_reply: r.owner_reply,
            owner_replied_at: r.owner_replied_at,
            created_at: r.created_at,
            updated_at: r.updated_at,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              address: user.address,
            },
          };
        });
      });
      return map;
    }
  }

  async findByUserId(userId) {
    const uId = parseInt(userId, 10);
    try {
      const res = await this.query(
        `SELECT r.id, r.user_id, r.store_id, r.rating_value, r.comment, r.owner_reply, r.owner_replied_at, r.created_at, r.updated_at,
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

  async findById(ratingId) {
    const rId = parseInt(ratingId, 10);
    try {
      const res = await this.query(
        `SELECT id, user_id, store_id, rating_value, comment, owner_reply, owner_replied_at, created_at, updated_at
         FROM ratings
         WHERE id = $1`,
        [rId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const found = this.inMemoryRatings.find((r) => r.id === rId);
      return found ? { ...found } : null;
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
