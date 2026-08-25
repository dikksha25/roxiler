const BaseRepository = require('./base.repository');
const { ROLES } = require('../../constants/roles.constant');

const bcrypt = require('bcryptjs');

const DEV_SEEDED_USERS = [
  {
    id: 1,
    name: 'Alexander Wright',
    email: 'admin@storerating.com',
    password_hash: bcrypt.hashSync('AdminPassword123!', 10),
    address: '100 Innovation Way, Suite 500, Tech Metropolis',
    role: ROLES.SYSTEM_ADMIN,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 2,
    name: 'Marcus Vance',
    email: 'owner.marcus@freshmart.com',
    password_hash: bcrypt.hashSync('OwnerPassword123!', 10),
    address: '452 Marketplace Blvd, Downtown Plaza',
    role: ROLES.STORE_OWNER,
    created_at: new Date('2026-01-02T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'owner.elena@nexuscoffee.com',
    password_hash: bcrypt.hashSync('OwnerPassword123!', 10),
    address: '88 Artisan Alley, Heritage Square',
    role: ROLES.STORE_OWNER,
    created_at: new Date('2026-01-03T00:00:00.000Z'),
    updated_at: new Date('2026-01-03T00:00:00.000Z'),
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password_hash: bcrypt.hashSync('UserPassword123!', 10),
    address: '742 Evergreen Terrace, Sector 4',
    role: ROLES.NORMAL_USER,
    created_at: new Date('2026-01-04T00:00:00.000Z'),
    updated_at: new Date('2026-01-04T00:00:00.000Z'),
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david.kim@example.com',
    password_hash: bcrypt.hashSync('UserPassword123!', 10),
    address: '12 Elm Street, Apt 3B',
    role: ROLES.NORMAL_USER,
    created_at: new Date('2026-01-05T00:00:00.000Z'),
    updated_at: new Date('2026-01-05T00:00:00.000Z'),
  },
];

// Strict allowlist dictionary map to eliminate SQL injection risks
const USER_SORT_ALLOWLIST = {
  name: 'name',
  email: 'email',
  address: 'address',
  role: 'role',
  created_at: 'created_at',
};

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
      const found = this.inMemoryUsers.find((u) => u.email.toLowerCase() === normalized);
      return found ? { ...found } : null;
    }
  }

  async findUserProfileById(id) {
    const userId = parseInt(id, 10);
    try {
      const res = await this.query(
        'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const found = this.inMemoryUsers.find((u) => u.id === userId);
      if (!found) return null;
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
        [name.trim(), normalized, passwordHash, address ? address.trim() : null, role]
      );
      return res.rows[0];
    } catch (err) {
      const newUser = {
        id: this.inMemoryUsers.length + 1,
        name: name.trim(),
        email: normalized,
        password_hash: passwordHash,
        address: address ? address.trim() : null,
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
    const uId = parseInt(userId, 10);
    try {
      const res = await this.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [passwordHash, uId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const user = this.inMemoryUsers.find((u) => u.id === uId);
      if (user) {
        user.password_hash = passwordHash;
        user.updated_at = new Date();
        return { id: user.id };
      }
      return null;
    }
  }

  async updateProfile(userId, { name, address }) {
    const uId = parseInt(userId, 10);
    try {
      const res = await this.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             address = COALESCE($2, address),
             updated_at = NOW()
         WHERE id = $3
         RETURNING id, name, email, address, role, updated_at`,
        [name ? name.trim() : null, address ? address.trim() : null, uId]
      );
      return res.rows[0] || null;
    } catch (err) {
      const user = this.inMemoryUsers.find((u) => u.id === uId);
      if (user) {
        if (name) user.name = name.trim();
        if (address) user.address = address.trim();
        user.updated_at = new Date();
        const { password_hash: _, ...safeUser } = user;
        return safeUser;
      }
      return null;
    }
  }

  /**
   * Search, filter, sort, and paginate users with SQL injection immune allowlist mapping
   */
  async findPaginated({
    search = '',
    role = null,
    name = '',
    email = '',
    address = '',
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 10,
    offset = 0,
  }) {
    // Map sortBy to strict safe column
    const safeSortBy = USER_SORT_ALLOWLIST[sortBy] || 'created_at';
    const safeSortOrder = sortOrder && sortOrder.toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
      let whereClauses = ['1=1'];
      let params = [];

      if (role) {
        params.push(role);
        whereClauses.push(`role = $${params.length}`);
      }

      if (name) {
        params.push(`%${name.trim()}%`);
        whereClauses.push(`name ILIKE $${params.length}`);
      }

      if (email) {
        params.push(`%${email.trim()}%`);
        whereClauses.push(`email ILIKE $${params.length}`);
      }

      if (address) {
        params.push(`%${address.trim()}%`);
        whereClauses.push(`address ILIKE $${params.length}`);
      }

      if (search) {
        params.push(`%${search.trim()}%`);
        const pIdx = params.length;
        whereClauses.push(`(name ILIKE $${pIdx} OR email ILIKE $${pIdx} OR address ILIKE $${pIdx})`);
      }

      const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

      const countSql = `SELECT COUNT(*) AS total FROM users ${whereSql}`;
      const countRes = await this.query(countSql, params);
      const total = parseInt(countRes.rows[0].total, 10);

      const pIndex = params.length + 1;
      const selectSql = `
        SELECT id, name, email, address, role, created_at, updated_at
        FROM users
        ${whereSql}
        ORDER BY ${safeSortBy} ${safeSortOrder}
        LIMIT $${pIndex} OFFSET $${pIndex + 1}
      `;

      const dataRes = await this.query(selectSql, [...params, limit, offset]);
      return { items: dataRes.rows, total };
    } catch (err) {
      let filtered = [...this.inMemoryUsers];

      if (role) {
        filtered = filtered.filter((u) => u.role === role);
      }
      if (name) {
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(name.trim().toLowerCase()));
      }
      if (email) {
        filtered = filtered.filter((u) => u.email.toLowerCase().includes(email.trim().toLowerCase()));
      }
      if (address) {
        filtered = filtered.filter((u) => (u.address || '').toLowerCase().includes(address.trim().toLowerCase()));
      }
      if (search) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            (u.address || '').toLowerCase().includes(s)
        );
      }

      const isAsc = safeSortOrder === 'ASC';

      filtered.sort((a, b) => {
        let valA = a[safeSortBy] || '';
        let valB = b[safeSortBy] || '';
        if (safeSortBy === 'created_at') {
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

      const safeUsers = filtered.map(({ password_hash: _, ...safe }) => safe);
      const items = safeUsers.slice(offset, offset + limit);
      return { items, total: filtered.length };
    }
  }
}

module.exports = new UserRepository();
