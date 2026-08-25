import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Pagination } from '../common/Pagination';
import { SkeletonTable } from '../common/SkeletonTable';
import { AddStoreModal } from './AddStoreModal';
import { StoreDetailModal } from './StoreDetailModal';
import { useDebounce } from '../../hooks/useDebounce';

const getStoreCategory = (name = '', address = '') => {
  const text = `${name} ${address}`.toLowerCase();
  if (text.includes('tech') || text.includes('laptop') || text.includes('electronic') || text.includes('device') || text.includes('smart') || text.includes('silicon')) {
    return { name: 'Tech & Electronics', icon: '⚡' };
  }
  if (text.includes('coffee') || text.includes('bakery') || text.includes('cafe') || text.includes('restaurant') || text.includes('roast') || text.includes('croissant')) {
    return { name: 'Cafe & Dining', icon: '☕' };
  }
  if (text.includes('market') || text.includes('organic') || text.includes('grocery') || text.includes('fresh') || text.includes('produce')) {
    return { name: 'Grocery & Mart', icon: '🥑' };
  }
  if (text.includes('boutique') || text.includes('fashion') || text.includes('apparel') || text.includes('wear') || text.includes('style') || text.includes('artisan')) {
    return { name: 'Fashion & Boutique', icon: '✨' };
  }
  return { name: 'Services & Wellness', icon: '🌿' };
};

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
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
    setSuccessMsg(`Commercial store "${newStore.name}" successfully registered!`);
    fetchStores();
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedStoreIds.size === stores.length && stores.length > 0) {
      setSelectedStoreIds(new Set());
    } else {
      setSelectedStoreIds(new Set(stores.map((s) => s.id)));
    }
  };

  const handleToggleSelectStore = (id) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportSelectedCSV = () => {
    const selectedStores = stores.filter((s) => selectedStoreIds.has(s.id));
    if (selectedStores.length === 0) return;

    const headers = ['ID', 'Store Name', 'Category', 'Email', 'Address', 'Rating Score', 'Reviews Count', 'Owner Name'];
    const rows = selectedStores.map((s) => {
      const cat = getStoreCategory(s.name, s.address);
      return [
        s.id,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        cat.name,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.address || '').replace(/"/g, '""')}"`,
        s.average_rating || '0.00',
        s.total_ratings || 0,
        `"${(s.owner_name || 'Unassigned').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stores_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg(`Exported ${selectedStores.length} store records to CSV!`);
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
            🏪 Commercial Store Registry
          </h2>
          <p style={{ color: 'var(--clay-text-muted)', margin: 0, fontSize: '0.92rem' }}>
            Registered storefronts, contact metadata, and store owner bindings.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          ➕ Register New Store
        </Button>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div>
            <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
              SEARCH STORE DIRECTORY
            </label>
            <input
              type="text"
              className="clay-input"
              placeholder="Search by store name, email, or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
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
                FILTER BY STORE NAME
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. FreshMart"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="clay-label" style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>
                FILTER BY STORE EMAIL
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="e.g. contact@"
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
                placeholder="e.g. Plaza or Avenue"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Stores Table */}
      <div className="clay-table-wrapper" style={{ marginBottom: '2rem' }}>
        {loading ? (
          <SkeletonTable rows={pagination.limit} columns={7} />
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="clay-orb clay-orb-pink" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px', fontSize: '1.5rem' }}>
              🏪
            </div>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              No commercial stores found matching the filter criteria.
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
                    checked={selectedStoreIds.size === stores.length && stores.length > 0}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    title="Select / Deselect All"
                  />
                </th>
                <th
                  onClick={() => handleSortToggle('name')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Store Name"
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
                  onClick={() => handleSortToggle('address')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Address"
                >
                  Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSortToggle('rating')}
                  style={{ cursor: 'pointer' }}
                  title="Click to sort by Rating"
                >
                  Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => {
                const isSelected = selectedStoreIds.has(s.id);
                const avg = parseFloat(s.average_rating || 0);
                const category = getStoreCategory(s.name, s.address);

                return (
                  <tr key={s.id} style={{ background: isSelected ? 'rgba(124, 58, 237, 0.08)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectStore(s.id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                      {s.name}
                    </td>
                    <td>
                      <span className="clay-badge clay-badge-purple" style={{ fontSize: '0.78rem' }}>
                        {category.icon} {category.name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--clay-text-muted)' }}>
                      {s.email}
                    </td>
                    <td
                      style={{
                        color: 'var(--clay-text-dim)',
                        maxWidth: '240px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={s.address || ''}
                    >
                      {s.address || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ color: avg > 0 ? 'var(--clay-warning)' : 'var(--clay-text-dim)', fontWeight: 800 }}>
                          ★ {avg.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--clay-text-dim)' }}>
                          ({s.total_ratings || 0})
                        </span>
                      </div>
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

        {/* Pagination Controls */}
        {stores.length > 0 && (
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
      {selectedStoreIds.size > 0 && (
        <div className="clay-bulk-toolbar">
          <span style={{ fontWeight: 800, color: 'var(--clay-text-primary)', fontSize: '0.92rem' }}>
            ✓ {selectedStoreIds.size} {selectedStoreIds.size === 1 ? 'store' : 'stores'} selected
          </span>
          <Button variant="primary" size="sm" onClick={handleExportSelectedCSV}>
            📥 Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelectedStoreIds(new Set())}>
            ✕ Clear
          </Button>
        </div>
      )}

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

export default StoreManagementPage;
