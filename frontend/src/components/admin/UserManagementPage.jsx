import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { SkeletonTable } from '../common/SkeletonTable';
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

  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState([]);

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

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedUserIds([]);
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

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleExportSelected = () => {
    const selectedData = users.filter((u) => selectedUserIds.includes(u.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `users_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg(`Exported ${selectedData.length} user records to JSON.`);
  };

  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

  return (
    <div className="fade-in">
      {/* Header with Title & Add User Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 900 }}>👥 User Management Directory</h2>
            {activeFiltersCount > 0 && (
              <span className="clay-badge clay-badge-purple">
                {activeFiltersCount} Active {activeFiltersCount === 1 ? 'Filter' : 'Filters'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
            Filter by Name, Email, Address, and Role with batch management tools.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Button
            variant="secondary"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
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

      {/* Floating Bulk Action Toolbar */}
      {selectedUserIds.length > 0 && (
        <div className="clay-bulk-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="clay-badge clay-badge-purple" style={{ fontSize: '0.9rem' }}>
              ✓ {selectedUserIds.length} Users Selected
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-muted)', fontWeight: 600 }}>
              Bulk operations available:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button variant="primary" size="sm" onClick={handleExportSelected}>
              📥 Export JSON ({selectedUserIds.length})
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedUserIds([])}>
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          {/* Global Search */}
          <div>
            <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder="Search across all fields..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              FILTER BY ROLE
            </label>
            <select
              className="clay-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value={ROLES.SYSTEM_ADMIN}>🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]}</option>
              <option value={ROLES.STORE_OWNER}>🏪 {ROLE_LABELS[ROLES.STORE_OWNER]}</option>
              <option value={ROLES.NORMAL_USER}>⭐ {ROLE_LABELS[ROLES.NORMAL_USER]}</option>
            </select>
          </div>

          {/* Sort Column & Direction */}
          <div>
            <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              SORT CRITERIA
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="clay-select"
                value={sort.sortBy}
                onChange={(e) => setSort((prev) => ({ ...prev, sortBy: e.target.value }))}
                style={{ flex: 1 }}
              >
                <option value="created_at">Joined Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="address">Address</option>
              </select>

              <button
                type="button"
                className="clay-btn clay-btn-secondary clay-btn-sm"
                onClick={() => setSort((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }))}
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
            className="clay-grid-3"
            style={{
              gap: '1rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '2px solid var(--border-subtle)',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                FILTER BY NAME
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Specific name match..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>

            <div>
              <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                FILTER BY EMAIL
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Specific email match..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>

            <div>
              <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                FILTER BY ADDRESS
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Specific address match..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeFiltersCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="clay-btn clay-btn-secondary clay-btn-sm"
              onClick={handleClearAllFilters}
            >
              ✕ Clear All Filters ({activeFiltersCount})
            </button>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <div className="clay-table-wrapper" style={{ marginBottom: '2rem' }}>
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px', fontSize: '1.5rem' }}>
              👥
            </div>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              No users found matching the selected filter criteria.
            </p>
            <Button variant="secondary" onClick={handleClearAllFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <table className="clay-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    title="Select / Deselect all users"
                  />
                </th>
                <th>ID</th>
                <th
                  onClick={() => handleSortToggle('name')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Name"
                >
                  Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSortToggle('email')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Email"
                >
                  Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSortToggle('role')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Role"
                >
                  Role {sort.sortBy === 'role' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSortToggle('address')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Address"
                >
                  Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <tr key={u.id} style={{ background: isSelected ? 'rgba(124, 58, 237, 0.08)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(u.id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                    <td style={{ color: 'var(--clay-text-dim)', fontWeight: 700 }}>
                      #{u.id}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background:
                              u.role === ROLES.SYSTEM_ADMIN
                                ? 'var(--clay-gradient-primary)'
                                : u.role === ROLES.STORE_OWNER
                                ? 'var(--clay-gradient-secondary)'
                                : 'var(--clay-gradient-tertiary)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clay-text-muted)' }}>
                      {u.email}
                    </td>
                    <td>
                      <Badge role={u.role} />
                    </td>
                    <td
                      style={{
                        color: 'var(--clay-text-dim)',
                        maxWidth: '240px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={u.address || ''}
                    >
                      {u.address || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                      >
                        👁️ Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
      </div>

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
