import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { AddUserModal } from './AddUserModal';
import { UserDetailModal } from './UserDetailModal';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    name: '',
    email: '',
    address: '',
  });

  const [sort, setSort] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        search: filters.search || undefined,
        role: filters.role || undefined,
        name: filters.name || undefined,
        email: filters.email || undefined,
        address: filters.address || undefined,
      };

      const res = await userService.getUsers(queryParams);
      if (res && res.data) {
        setUsers(res.data.users || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalItems: res.pagination.totalItems,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.sortBy, sort.sortOrder, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSortToggle = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      name: '',
      email: '',
      address: '',
    });
    setSort({ sortBy: 'created_at', sortOrder: 'DESC' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUserCreated = (newUser) => {
    setSuccessMsg(`User "${newUser.name}" (${ROLE_LABELS[newUser.role]}) created successfully!`);
    fetchUsers();
  };

  return (
    <div className="fade-in">
      {/* Header with Title & Add User Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>👥 User Management Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Create and govern platform users, assign roles, inspect account profiles, and perform filtered searches.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          ➕ Add New User
        </Button>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-4" style={{ gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Global Search */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, email, or address..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              FILTER BY ROLE
            </label>
            <select
              className="input-field"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            >
              <option value="">All User Roles</option>
              <option value={ROLES.SYSTEM_ADMIN}>🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]}</option>
              <option value={ROLES.STORE_OWNER}>🏪 {ROLE_LABELS[ROLES.STORE_OWNER]}</option>
              <option value={ROLES.NORMAL_USER}>⭐ {ROLE_LABELS[ROLES.NORMAL_USER]}</option>
            </select>
          </div>

          {/* Sort Column & Order */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              SORT CRITERIA
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <select
                className="input-field"
                value={sort.sortBy}
                onChange={(e) => setSort((prev) => ({ ...prev, sortBy: e.target.value }))}
                style={{ fontSize: '0.85rem', flex: 1 }}
              >
                <option value="created_at">Joined Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="address">Address</option>
              </select>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSort((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }))}
                style={{ fontSize: '0.85rem', padding: '0 0.6rem' }}
                title="Toggle ASC/DESC"
              >
                {sort.sortOrder === 'ASC' ? '▲ ASC' : '▼ DESC'}
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <div>
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading user accounts...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
              No users found matching the selected search criteria.
            </p>
            <Button variant="secondary" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('name')}
                  >
                    Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('email')}
                  >
                    Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('role')}
                  >
                    Role {sort.sortBy === 'role' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('address')}
                  >
                    Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      #{u.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge role={u.role} />
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--text-dim)',
                        maxWidth: '260px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={u.address || ''}
                    >
                      {u.address || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(u)}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            Showing <strong>{users.length}</strong> of <strong>{pagination.totalItems}</strong> users
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              &larr; Prev
            </button>

            <span>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>

            <button
              className="btn btn-secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
};
