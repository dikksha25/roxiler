import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { Pagination } from '../common/Pagination';
import { RateStoreModal } from './RateStoreModal';
import { useDebounce } from '../../hooks/useDebounce';

export const UserStoreBrowsePage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
  });

  const [viewMode, setViewMode] = useState('grid'); // grid, table

  // Filter input state
  const [searchInput, setSearchInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

  // Debounced values
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedAddress = useDebounce(addressInput, 300);

  // Sorting state
  const [sort, setSort] = useState({
    sortBy: 'rating',
    sortOrder: 'DESC',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Rating Modal
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);

  const activeFiltersCount = [
    debouncedSearch,
    debouncedName,
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
        address: debouncedAddress || undefined,
      };

      const res = await storeService.browseStores(queryParams);
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
      setError(err.response?.data?.message || 'Failed to load store directory.');
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
    debouncedAddress,
  ]);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, debouncedName, debouncedAddress, sort]);

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
    setAddressInput('');
    setSort({ sortBy: 'rating', sortOrder: 'DESC' });
  };

  const handleRatingSuccess = (ratingData) => {
    setSuccessMsg('Your rating was submitted successfully! Overall score updated.');
    fetchStores();
  };

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            🏪 Commercial Stores Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Browse registered stores, view overall ratings, and submit or modify your personal star ratings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            style={{ fontSize: '0.85rem' }}
          >
            🔲 Grid Cards
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            style={{ fontSize: '0.85rem' }}
          >
            📋 Table View
          </button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-3" style={{ gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Global Search */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              SEARCH STORES
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by store name or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Sort Criteria */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
              SORT STORES BY
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <select
                className="input-field"
                value={sort.sortBy}
                onChange={(e) => setSort((prev) => ({ ...prev, sortBy: e.target.value }))}
                style={{ fontSize: '0.85rem', flex: 1 }}
              >
                <option value="rating">Overall Rating (Highest)</option>
                <option value="user_rating">My Submitted Rating</option>
                <option value="name">Store Name</option>
                <option value="address">Address</option>
                <option value="created_at">Date Added</option>
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

          {/* Filter Toggle & Clear */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              style={{ flex: 1, fontSize: '0.85rem' }}
            >
              {showAdvancedFilters ? '▲ Hide Filters' : '▼ Specific Filters'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                onClick={handleClearAllFilters}
                style={{ fontSize: '0.85rem' }}
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Specific Filters */}
        {showAdvancedFilters && (
          <div
            className="grid grid-2 fade-in"
            style={{
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY STORE NAME
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. FreshMart"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                FILTER BY ADDRESS
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Plaza or Avenue"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Spinner size={40} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Fetching stores and your personalized rating status...
          </p>
        </div>
      ) : stores.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Stores Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            We couldn't find any stores matching your current search criteria. Try adjusting your filters.
          </p>
          <Button variant="secondary" onClick={handleClearAllFilters}>
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-3" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
          {stores.map((s) => {
            const overallAvg = parseFloat(s.overall_rating || s.average_rating || 0);
            const isUserRated = s.user_rating !== null && s.user_rating !== undefined;

            return (
              <Card
                key={s.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  padding: '1.5rem',
                }}
              >
                <div>
                  {/* Top Bar: Store Name & Overall Rating Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {s.name}
                    </h3>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                    📍 {s.address}
                  </p>

                  {/* Rating Box 1: Overall Store Rating */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Overall Community Rating
                      </span>
                      <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 800 }}>
                        ★ {overallAvg.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                      <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                        {'★'.repeat(Math.round(overallAvg))}{'☆'.repeat(5 - Math.round(overallAvg))}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {s.rating_count || 0} {s.rating_count === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>

                  {/* Rating Box 2: User's Own Submitted Rating */}
                  <div
                    style={{
                      background: isUserRated ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      border: isUserRated ? '1px solid rgba(16, 185, 129, 0.25)' : '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Your Rating
                      </span>
                      {isUserRated ? (
                        <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 700 }}>
                          ⭐ {s.user_rating} / 5 Stars
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                          ⚪ Not Rated Yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating CTA Button */}
                <div>
                  <Button
                    variant={isUserRated ? 'secondary' : 'primary'}
                    onClick={() => setSelectedStoreForRating(s)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    {isUserRated ? '✏️ Modify Your Rating' : '⭐ Rate This Store'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('name')}
                  >
                    Store Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('address')}
                  >
                    Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('rating')}
                  >
                    Overall Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('user_rating')}
                  >
                    Your Rating {sort.sortBy === 'user_rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => {
                  const overallAvg = parseFloat(s.overall_rating || s.average_rating || 0);
                  const isUserRated = s.user_rating !== null && s.user_rating !== undefined;

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {s.address}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                            ★ {overallAvg.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ({s.rating_count || 0})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {isUserRated ? (
                          <span style={{ color: 'var(--accent-success)', fontWeight: 600, fontSize: '0.8rem' }}>
                            ⭐ {s.user_rating} / 5 Stars
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            ⚪ Not Rated
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Button
                          variant={isUserRated ? 'secondary' : 'primary'}
                          onClick={() => setSelectedStoreForRating(s)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          {isUserRated ? '✏️ Modify' : '⭐ Rate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Footer */}
      {stores.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            totalItems={pagination.totalItems}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onPageSizeChange={(newSize) => setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
            pageSizeOptions={[3, 6, 12, 24]}
          />
        </Card>
      )}

      {/* Rate / Modify Store Modal */}
      <RateStoreModal
        isOpen={!!selectedStoreForRating}
        onClose={() => setSelectedStoreForRating(null)}
        store={selectedStoreForRating}
        onRatingSubmitted={handleRatingSuccess}
      />
    </div>
  );
};
