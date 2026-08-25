import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { Pagination } from '../common/Pagination';
import { AddUserModal } from './AddUserModal';
import { UserDetailModal } from './UserDetailModal';
import { useDebounce } from '../../hooks/useDebounce';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Filter input state
  const [searchInput, setSearchInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Debounced search values
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedAddress = useDebounce(addressInput, 300);

  // Sorting state
  const [sort, setSort] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Calculate active filter count
  const activeFiltersCount = [
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
    roleFilter,
  ].filter(Boolean).length;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        name: debouncedName || undefined,
        email: debouncedEmail || undefined,
        address: debouncedAddress || undefined,
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
  }, [
    pagination.page,
    pagination.limit,
    sort.sortBy,
    sort.sortOrder,
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
    roleFilter,
  ]);

  // Reset to page 1 whenever any filter or sort changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, debouncedName, debouncedEmail, debouncedAddress, roleFilter, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSortToggle = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setNameInput('');
    setEmailInput('');
    setAddressInput('');
    setRoleFilter('');
    setSort({ sortBy: 'created_at', sortOrder: 'DESC' });
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>👥 User Management Directory</h2>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                {activeFiltersCount} Active {activeFiltersCount === 1 ? 'Filter' : 'Filters'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Filter by Name, Email, Address, and Role with server-side multi-criteria sorting and pagination.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="secondary"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            style={{ fontSize: '0.85rem' }}
          >
            {showAdvancedFilters ? '▲ Hide Filters' : '▼ Specific Filters'}
          </Button>
          <Button variant="primary" onClick={() => setIsAddOpen(true)}>
            ➕ Add New User
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Toolbar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-3" style={{ gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Global Search */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Search across all fields..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            >
              <option value="">All Roles</option>
              <option value={ROLES.SYSTEM_ADMIN}>🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]}</option>
              <option value={ROLES.STORE_OWNER}>🏪 {ROLE_LABELS[ROLES.STORE_OWNER]}</option>
              <option value={ROLES.NORMAL_USER}>⭐ {ROLE_LABELS[ROLES.NORMAL_USER]}</option>
            </select>
          </div>

          {/* Sort Column & Direction */}
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
        </div>

        {/* Specific Multi-Field Filters (Collapsible) */}
        {showAdvancedFilters && (
          <div
            className="grid grid-3 fade-in"
            style={{
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              alignItems: 'flex-end',
            }}
          >
            {/* Filter by Name */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY NAME
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Specific name match..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            {/* Filter by Email */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY EMAIL
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Specific email match..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            {/* Filter by Address */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY ADDRESS
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Specific address match..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>
        )}

        {activeFiltersCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearAllFilters}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              ✕ Clear All Filters ({activeFiltersCount})
            </button>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Executing server-side query...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
              No users found matching the selected filter criteria.
            </p>
            <Button variant="secondary" onClick={handleClearAllFilters}>
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
                    title="Click to sort by Name"
                  >
                    Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('email')}
                    title="Click to sort by Email"
                  >
                    Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('role')}
                    title="Click to sort by Role"
                  >
                    Role {sort.sortBy === 'role' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('address')}
                    title="Click to sort by Address"
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

        {/* Reusable Pagination Component */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.totalItems}
          onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
          onPageSizeChange={(newSize) => setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
        />
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
