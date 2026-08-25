import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { Pagination } from '../common/Pagination';
import { AddStoreModal } from './AddStoreModal';
import { StoreDetailModal } from './StoreDetailModal';
import { useDebounce } from '../../hooks/useDebounce';

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
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

  // Debounced filter values
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
  const [selectedStore, setSelectedStore] = useState(null);

  // Calculate active filter count
  const activeFiltersCount = [
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
  ].filter(Boolean).length;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        search: debouncedSearch || undefined,
        name: debouncedName || undefined,
        email: debouncedEmail || undefined,
        address: debouncedAddress || undefined,
      };

      const res = await storeService.getStores(queryParams);
      if (res && res.data) {
        setStores(res.data.stores || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalItems: res.pagination.totalItems,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve store registry.');
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
  ]);

  // Reset to page 1 whenever any filter or sort changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, debouncedName, debouncedEmail, debouncedAddress, sort]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
    setSort({ sortBy: 'created_at', sortOrder: 'DESC' });
  };

  const handleStoreCreated = (newStore) => {
    setSuccessMsg(`Store "${newStore.name}" registered successfully!`);
    fetchStores();
  };

  return (
    <div className="fade-in">
      {/* Header with Title & Add Store Action */}
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
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🏪 Commercial Store Registry</h2>
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
            Filter by Name, Email, Address, and Rating with server-side multi-criteria sorting and pagination.
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
            ➕ Add New Store
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-2" style={{ gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, email, address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Sort Criteria */}
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
                <option value="created_at">Registered Date</option>
                <option value="name">Store Name</option>
                <option value="email">Email</option>
                <option value="rating">Overall Rating</option>
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
                FILTER BY STORE NAME
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Specific store name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            {/* Filter by Email */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY STORE EMAIL
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Specific store email..."
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
                placeholder="Specific address..."
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

      {/* Stores Listing Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Executing server-side query...
            </p>
          </div>
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
              No stores found matching the selected filter criteria.
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
                    Store Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
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
                    onClick={() => handleSortToggle('rating')}
                    title="Click to sort by Overall Rating"
                  >
                    Overall Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Owner</th>
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
                {stores.map((s) => {
                  const rating = parseFloat(s.overall_rating || s.average_rating || 0);
                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                        #{s.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {s.email}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                            ★ {rating.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ({s.rating_count || 0})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                          {s.owner_name || `Owner #${s.owner_id || 'None'}`}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          color: 'var(--text-dim)',
                          maxWidth: '240px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={s.address}
                      >
                        {s.address}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSelectedStore(s)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          👁️ View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onStoreCreated={handleStoreCreated}
      />

      {/* Store Detail Modal */}
      <StoreDetailModal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        store={selectedStore}
      />
    </div>
  );
};
