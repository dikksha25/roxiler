import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Pagination } from '../common/Pagination';
import { SkeletonTable } from '../common/SkeletonTable';
import { AddUserModal } from './AddUserModal';
import { UserDetailModal } from './UserDetailModal';
import { useDebounce } from '../../hooks/useDebounce';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
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

  // Reset to page 1 on filter/sort changes
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
    setSuccessMsg(`User "${newUser.name}" successfully created with role ${newUser.role}!`);
    fetchUsers();
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedUserIds.size === users.length && users.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleToggleSelectUser = (id) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportSelectedCSV = () => {
    const selectedUsers = users.filter((u) => selectedUserIds.has(u.id));
    if (selectedUsers.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Role', 'Address', 'Created At'];
    const rows = selectedUsers.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role,
      `"${(u.address || '').replace(/"/g, '""')}"`,
      u.created_at || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg(`Exported ${selectedUsers.length} user records to CSV!`);
  };

  return (
    <div>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 900 }}>
            👥 User Directory &amp; RBAC Control
          </h2>
          <p style={{ color: 'var(--clay-text-muted)', margin: 0, fontSize: '0.92rem' }}>
            System-wide directory of administrators, store owners, and consumers.
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
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div>
            <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder="Search by name, email, or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div>
            <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
              FILTER BY USER ROLE
            </label>
            <select
              className="clay-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles ({pagination.totalItems})</option>
              <option value={ROLES.SYSTEM_ADMIN}>🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]}</option>
              <option value={ROLES.STORE_OWNER}>🏪 {ROLE_LABELS[ROLES.STORE_OWNER]}</option>
              <option value={ROLES.NORMAL_USER}>⭐ {ROLE_LABELS[ROLES.NORMAL_USER]}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              style={{ flex: 1 }}
            >
              {showAdvancedFilters ? '▲ Hide' : '▼ More Filters'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                onClick={handleClearAllFilters}
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div
            className="clay-grid-3"
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '2px solid rgba(124, 58, 237, 0.08)',
            }}
          >
            <div>
              <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
                FILTER BY NAME
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. Elena or Marcus"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
                FILTER BY EMAIL
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. @freshmart.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <div>
              <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
                FILTER BY ADDRESS
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. Boulevard or Lane"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <div className="clay-table-wrapper" style={{ marginBottom: '2rem' }}>
        {loading ? (
          <SkeletonTable rows={pagination.limit} columns={6} />
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
                    checked={selectedUserIds.size === users.length && users.length > 0}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    title="Select / Deselect All"
                  />
                </th>
                <th>User Profile</th>
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
                const isSelected = selectedUserIds.has(u.id);
                const initials = (u.name || 'User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={u.id} style={{ background: isSelected ? 'rgba(124, 58, 237, 0.08)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectUser(u.id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          className="clay-orb clay-orb-purple"
                          style={{ width: '36px', height: '36px', fontSize: '0.85rem', fontWeight: 900 }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--clay-text-dim)' }}>
                            ID: #{u.id}
                          </div>
                        </div>
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

        {/* Pagination Component */}
        {users.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            totalItems={pagination.totalItems}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onPageSizeChange={(newSize) => setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
          />
        )}
      </div>

      {/* Floating Bulk Selection Toolbar */}
      {selectedUserIds.size > 0 && (
        <div className="clay-bulk-toolbar">
          <span style={{ fontWeight: 800, color: 'var(--clay-text-primary)', fontSize: '0.92rem' }}>
            ✓ {selectedUserIds.size} {selectedUserIds.size === 1 ? 'user' : 'users'} selected
          </span>
          <Button variant="primary" size="sm" onClick={handleExportSelectedCSV}>
            📥 Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelectedUserIds(new Set())}>
            ✕ Clear
          </Button>
        </div>
      )}

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

export default UserManagementPage;
