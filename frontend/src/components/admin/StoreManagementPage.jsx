import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { AddStoreModal } from './AddStoreModal';
import { StoreDetailModal } from './StoreDetailModal';

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: '',
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
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        search: filters.search || undefined,
        name: filters.name || undefined,
        email: filters.email || undefined,
        address: filters.address || undefined,
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
  }, [pagination.page, pagination.limit, sort.sortBy, sort.sortOrder, filters]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
      name: '',
      email: '',
      address: '',
    });
    setSort({ sortBy: 'created_at', sortOrder: 'DESC' });
    setPagination((prev) => ({ ...prev, page: 1 }));
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
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🏪 Commercial Store Registry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Register verified stores, associate them with STORE_OWNER accounts, and inspect dynamic rating metrics.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          ➕ Add New Store
        </Button>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-4" style={{ gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Search */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, email, address..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Filter by Name */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              STORE NAME
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Filter by store name..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
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

          {/* Clear Filters */}
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

      {/* Stores Listing Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading commercial store directory...
            </p>
          </div>
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
              No stores found matching the selected search criteria.
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
                    Store Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('email')}
                  >
                    Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('rating')}
                  >
                    Overall Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Owner</th>
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
            Showing <strong>{stores.length}</strong> of <strong>{pagination.totalItems}</strong> stores
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
