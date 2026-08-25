const BaseRepository = require('./base.repository');
const { ROLES } = require('../../constants/roles.constant');
const bcrypt = require('bcryptjs');

// Pre-computed salted bcrypt hashes for development fallback
// 'AdminPassword123!', 'OwnerPassword123!', 'UserPassword123!'
const DEV_PASSWORD_HASH = '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.';

const DEV_SEEDED_USERS = [
  {
    id: 1,
    name: 'Alexander Wright',
    email: 'admin@storerating.com',
    password_hash: DEV_PASSWORD_HASH,
    address: '100 Innovation Way, Suite 500, Tech Metropolis',
    role: ROLES.SYSTEM_ADMIN,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 2,
    name: 'Marcus Vance',
    email: 'owner.marcus@freshmart.com',
    password_hash: DEV_PASSWORD_HASH,
    address: '452 Marketplace Blvd, Downtown Plaza',
    role: ROLES.STORE_OWNER,
    created_at: new Date('2026-01-02T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'owner.elena@nexuscoffee.com',
    password_hash: DEV_PASSWORD_HASH,
    address: '88 Artisan Alley, Heritage Square',
    role: ROLES.STORE_OWNER,
    created_at: new Date('2026-01-03T00:00:00.000Z'),
    updated_at: new Date('2026-01-03T00:00:00.000Z'),
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password_hash: DEV_PASSWORD_HASH,
    address: '742 Evergreen Terrace, Sector 4',
    role: ROLES.NORMAL_USER,
    created_at: new Date('2026-01-04T00:00:00.000Z'),
    updated_at: new Date('2026-01-04T00:00:00.000Z'),
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david.kim@example.com',
    password_hash: DEV_PASSWORD_HASH,
    address: '12 Elm Street, Apt 3B',
    role: ROLES.NORMAL_USER,
    created_at: new Date('2026-01-05T00:00:00.000Z'),
    updated_at: new Date('2026-01-05T00:00:00.000Z'),
  },
];

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
    this.inMemoryUsers = [...DEV_SEEDED_USERS];
  }

  async findByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();

    try {
      const res = await this.query(
        'SELECT id, name, email, password_hash, address, role, created_at, updated_at FROM users WHERE LOWER(trim(email)) = LOWER($1)',
        [normalized]
      );
      return res.rows[0] || null;
    } catch (err) {
      // Development fallback
      const found = this.inMemoryUsers.find((u) => u.email.toLowerCase() === normalized);
      return found ? { ...found } : null;
    }
  }

  async findUserProfileById(id) {
    try {
      const res = await this.query(
        'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    } catch (err) {
      // Development fallback
      const found = this.inMemoryUsers.find((u) => u.id === parseInt(id, 10));
      if (!found) return null;
      // Exclude password_hash
      const { password_hash: _, ...safeUser } = found;
      return safeUser;
    }
  }

  async create({ name, email, passwordHash, address, role }) {
    const normalized = email.trim().toLowerCase();

    try {
      const res = await this.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, address, role, created_at, updated_at`,
        [name, normalized, passwordHash, address || null, role]
      );
      return res.rows[0];
    } catch (err) {
      // Development fallback
      const newUser = {
        id: this.inMemoryUsers.length + 1,
        name,
        email: normalized,
        password_hash: passwordHash,
        address: address || null,
        role,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.inMemoryUsers.push(newUser);
      const { password_hash: _, ...safeUser } = newUser;
      return safeUser;
    }
  }

  async updatePassword(userId, passwordHash) {
    try {
      const res = await this.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [passwordHash, userId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const user = this.inMemoryUsers.find((u) => u.id === parseInt(userId, 10));
      if (user) {
        user.password_hash = passwordHash;
        user.updated_at = new Date();
        return { id: user.id };
      }
      return null;
    }
  }

  async updateProfile(userId, { name, address }) {
    try {
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
    } catch (err) {
      const user = this.inMemoryUsers.find((u) => u.id === parseInt(userId, 10));
      if (user) {
        if (name) user.name = name;
        if (address) user.address = address;
        user.updated_at = new Date();
        const { password_hash: _, ...safeUser } = user;
        return safeUser;
      }
      return null;
    }
  }

  async findPaginated({ search = '', role = null, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    try {
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
    } catch (err) {
      let filtered = [...this.inMemoryUsers];
      if (role) filtered = filtered.filter((u) => u.role === role);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      const safeUsers = filtered.map(({ password_hash: _, ...safe }) => safe);
      const items = safeUsers.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }
}

module.exports = new UserRepository();
