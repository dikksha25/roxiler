import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { SkeletonTable } from '../common/SkeletonTable';
import { Pagination } from '../common/Pagination';
import { AddStoreModal } from './AddStoreModal';
import { StoreDetailModal } from './StoreDetailModal';
import { useDebounce } from '../../hooks/useDebounce';

// Determine store category badge
const getCategoryBadge = (name = '') => {
  const t = name.toLowerCase();
  if (t.includes('coffee') || t.includes('bakery') || t.includes('cafe')) {
    return { label: '☕ Cafe & Bakery', color: 'clay-badge-amber' };
  }
  if (t.includes('mart') || t.includes('organic') || t.includes('grocery')) {
    return { label: '🥑 Grocery & Organics', color: 'clay-badge-green' };
  }
  if (t.includes('tech') || t.includes('electronic') || t.includes('device') || t.includes('apex')) {
    return { label: '⚡ Electronics & Tech', color: 'clay-badge-purple' };
  }
  return { label: '🛍️ Commercial Retail', color: 'clay-badge-blue' };
};

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Bulk selection state
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);

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

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedStoreIds([]);
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

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStoreIds(stores.map((s) => s.id));
    } else {
      setSelectedStoreIds([]);
    }
  };

  const handleToggleStore = (storeId) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  };

  const handleExportSelected = () => {
    const selectedData = stores.filter((s) => selectedStoreIds.includes(s.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stores_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg(`Exported ${selectedData.length} store records to JSON.`);
  };

  const isAllSelected = stores.length > 0 && selectedStoreIds.length === stores.length;

  return (
    <div className="fade-in">
      {/* Header with Title & Add Store Action */}
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
            <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 900 }}>🏪 Commercial Store Registry</h2>
            {activeFiltersCount > 0 && (
              <span className="clay-badge clay-badge-purple">
                {activeFiltersCount} Active {activeFiltersCount === 1 ? 'Filter' : 'Filters'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
            Filter by Name, Email, Address, and Rating with batch export tools.
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
            ➕ Add New Store
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Floating Bulk Toolbar when items are selected */}
      {selectedStoreIds.length > 0 && (
        <div className="clay-bulk-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="clay-badge clay-badge-purple" style={{ fontSize: '0.9rem' }}>
              ✓ {selectedStoreIds.length} Stores Selected
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-muted)', fontWeight: 600 }}>
              Bulk operations available:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button variant="primary" size="sm" onClick={handleExportSelected}>
              📥 Export JSON ({selectedStoreIds.length})
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedStoreIds([])}>
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          {/* Search */}
          <div>
            <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              GLOBAL SEARCH
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder="Search by name, email, address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Sort Criteria */}
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
                <option value="created_at">Registered Date</option>
                <option value="name">Store Name</option>
                <option value="email">Email</option>
                <option value="rating">Overall Rating</option>
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
                FILTER BY STORE NAME
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Specific store name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>

            <div>
              <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                FILTER BY STORE EMAIL
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Specific store email..."
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
                placeholder="Specific address..."
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

      {/* Stores Listing Table */}
      <div className="clay-table-wrapper" style={{ marginBottom: '2rem' }}>
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="clay-orb clay-orb-pink" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px', fontSize: '1.5rem' }}>
              🏪
            </div>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              No stores found matching the selected filter criteria.
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
                    title="Select / Deselect all stores"
                  />
                </th>
                <th>ID</th>
                <th
                  onClick={() => handleSortToggle('name')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Name"
                >
                  Store Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th>Category</th>
                <th
                  onClick={() => handleSortToggle('email')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Email"
                >
                  Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSortToggle('rating')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Overall Rating"
                >
                  Overall Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th>Assigned Owner</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => {
                const rating = parseFloat(s.overall_rating || s.average_rating || 0);
                const isSelected = selectedStoreIds.includes(s.id);
                const cat = getCategoryBadge(s.name);

                return (
                  <tr key={s.id} style={{ background: isSelected ? 'rgba(124, 58, 237, 0.08)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleStore(s.id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                    <td style={{ color: 'var(--clay-text-dim)', fontWeight: 700 }}>
                      #{s.id}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                      {s.name}
                    </td>
                    <td>
                      <span className={`clay-badge ${cat.color}`} style={{ fontSize: '0.75rem' }}>
                        {cat.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--clay-text-muted)' }}>
                      {s.email}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ color: 'var(--clay-warning)', fontWeight: 900 }}>
                          ★ {rating.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
                          ({s.rating_count || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="clay-badge clay-badge-green">
                        {s.owner_name || `Owner #${s.owner_id || 'None'}`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedStore(s)}
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
