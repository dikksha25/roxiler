import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Pagination } from '../common/Pagination';
import { SkeletonCard } from '../common/SkeletonCard';
import { SkeletonTable } from '../common/SkeletonTable';
import { RateStoreModal } from './RateStoreModal';
import { useDebounce } from '../../hooks/useDebounce';

// Helper to determine category branding, gradient banner & icon
const getStoreCategoryDetails = (storeName = '', storeEmail = '') => {
  const text = `${storeName} ${storeEmail}`.toLowerCase();

  if (text.includes('coffee') || text.includes('bakery') || text.includes('cafe') || text.includes('roast') || text.includes('bistro') || text.includes('dining')) {
    return {
      category: 'Cafe & Dining',
      bannerClass: 'clay-banner-cafe',
      icon: '☕',
      tag: 'Artisan Roast',
    };
  }
  if (text.includes('mart') || text.includes('market') || text.includes('organic') || text.includes('grocery') || text.includes('food')) {
    return {
      category: 'Grocery & Organics',
      bannerClass: 'clay-banner-grocery',
      icon: '🥑',
      tag: 'Fresh Produce',
    };
  }
  if (text.includes('tech') || text.includes('electronic') || text.includes('device') || text.includes('smart') || text.includes('apex') || text.includes('digital')) {
    return {
      category: 'Tech & Electronics',
      bannerClass: 'clay-banner-tech',
      icon: '⚡',
      tag: 'Smart Gadgets',
    };
  }
  if (text.includes('fashion') || text.includes('boutique') || text.includes('cloth') || text.includes('apparel') || text.includes('style')) {
    return {
      category: 'Fashion & Boutique',
      bannerClass: 'clay-banner-fashion',
      icon: '✨',
      tag: 'Curated Wear',
    };
  }
  if (text.includes('wellness') || text.includes('spa') || text.includes('health') || text.includes('care')) {
    return {
      category: 'Services & Wellness',
      bannerClass: 'clay-banner-wellness',
      icon: '🌿',
      tag: 'Self Care',
    };
  }

  return {
    category: 'Commercial Retail',
    bannerClass: 'clay-banner-general',
    icon: '🛍️',
    tag: 'Verified Merchant',
  };
};

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
  const [minRatingFilter, setMinRatingFilter] = useState('ALL'); // ALL, 4.0, 4.5, MY_RATED

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
    minRatingFilter !== 'ALL' ? minRatingFilter : null,
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
        let fetchedStores = res.data.stores || [];

        // Apply client-side quick score filter
        if (minRatingFilter === '4.0') {
          fetchedStores = fetchedStores.filter(
            (s) => parseFloat(s.overall_rating || s.average_rating || 0) >= 4.0
          );
        } else if (minRatingFilter === '4.5') {
          fetchedStores = fetchedStores.filter(
            (s) => parseFloat(s.overall_rating || s.average_rating || 0) >= 4.5
          );
        } else if (minRatingFilter === 'MY_RATED') {
          fetchedStores = fetchedStores.filter(
            (s) => s.user_rating !== null && s.user_rating !== undefined
          );
        }

        setStores(fetchedStores);
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
    minRatingFilter,
  ]);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, debouncedName, debouncedAddress, sort, minRatingFilter]);

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
    setMinRatingFilter('ALL');
    setSort({ sortBy: 'rating', sortOrder: 'DESC' });
  };

  const handleRatingSuccess = ({ storeId, ratingValue, comment, isModify }) => {
    setStores((prevStores) =>
      prevStores.map((st) => {
        if (st.id === storeId) {
          return {
            ...st,
            user_rating: ratingValue,
            my_rating: ratingValue,
            my_comment: comment,
          };
        }
        return st;
      })
    );

    setSuccessMsg(
      isModify
        ? `Rating for store updated successfully to ${ratingValue} Stars!`
        : `Thank you! Your ${ratingValue}-star rating was recorded successfully.`
    );

    fetchStores();
  };

  return (
    <div className="clay-page">
      <div className="clay-container">
        {/* Header Title & View Toggle */}
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
            <span className="clay-badge clay-badge-purple" style={{ marginBottom: '0.5rem' }}>
              COMMUNITY DIRECTORY
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', margin: 0, fontWeight: 900 }}>
              🏪 Store Catalog &amp; Reviews
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className={`clay-btn ${viewMode === 'grid' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setViewMode('grid')}
            >
              🔲 Grid Cards
            </button>
            <button
              type="button"
              className={`clay-btn ${viewMode === 'table' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              onClick={() => setViewMode('table')}
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
        <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
            {/* Global Search */}
            <div>
              <label className="clay-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                SEARCH STORES
              </label>
              <input
                type="text"
                className="clay-input"
                placeholder="Search by store name, address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Sort Criteria */}
            <div>
              <label className="clay-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                SORT STORES BY
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="clay-select"
                  value={sort.sortBy}
                  onChange={(e) => setSort((prev) => ({ ...prev, sortBy: e.target.value }))}
                  style={{ flex: 1 }}
                >
                  <option value="rating">Overall Rating (Highest)</option>
                  <option value="user_rating">My Submitted Rating</option>
                  <option value="name">Store Name</option>
                  <option value="address">Address</option>
                  <option value="created_at">Date Added</option>
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

            {/* Filter Toggle & Clear */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Button
                variant="secondary"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                style={{ flex: 1 }}
              >
                {showAdvancedFilters ? '▲ Hide Filters' : '▼ Specific Filters'}
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

          {/* Quick Score Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '2px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--clay-text-muted)', fontFamily: 'var(--font-heading)' }}>
              Quick Rating Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Scores' },
              { id: '4.0', label: '⭐ 4.0+ Stars' },
              { id: '4.5', label: '🏆 4.5+ Top Tier' },
              { id: 'MY_RATED', label: '✨ My Rated Stores' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setMinRatingFilter(chip.id)}
                className={`clay-btn clay-btn-sm ${minRatingFilter === chip.id ? 'clay-btn-primary' : 'clay-btn-secondary'}`}
                style={{ borderRadius: '9999px', fontSize: '0.8rem', padding: '0.4rem 0.95rem' }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Collapsible Specific Filters */}
          {showAdvancedFilters && (
            <div
              className="clay-grid-2"
              style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '2px solid var(--border-subtle)',
              }}
            >
              <div>
                <label className="clay-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
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
                <label className="clay-label" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
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

        {/* Main Content Area */}
        {loading ? (
          viewMode === 'grid' ? (
            <div className="clay-grid-3" style={{ marginBottom: '2.5rem' }}>
              <SkeletonCard count={6} />
            </div>
          ) : (
            <div style={{ marginBottom: '2.5rem' }}>
              <SkeletonTable rows={6} cols={5} />
            </div>
          )
        ) : stores.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', fontSize: '1.8rem' }}>
              🔍
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900 }}>No Stores Found</h3>
            <p style={{ color: 'var(--clay-text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
              We couldn't find any stores matching your current search criteria. Try adjusting your filters.
            </p>
            <Button variant="secondary" onClick={handleClearAllFilters}>
              Reset All Filters
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          /* GRID CARDS VIEW WITH BRAND BANNERS & TRUST SEALS */
          <div className="clay-grid-3" style={{ marginBottom: '2.5rem' }}>
            {stores.map((s) => {
              const overallAvg = parseFloat(s.overall_rating || s.average_rating || 0);
              const reviewCount = s.rating_count || 0;
              const hasReviews = reviewCount > 0 && overallAvg > 0;
              const isUserRated = s.user_rating !== null && s.user_rating !== undefined;
              const isTopRated = overallAvg >= 4.8 && reviewCount >= 2;
              const catDetails = getStoreCategoryDetails(s.name, s.email);

              return (
                <Card
                  key={s.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    {/* Vibrant Category Cover Banner */}
                    <div className={`clay-store-banner ${catDetails.bannerClass}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{catDetails.icon}</span>
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
                            {catDetails.category}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.8 }}>
                            {catDetails.tag}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {isTopRated && (
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.92)',
                              color: '#B45309',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            }}
                          >
                            🏆 Top Rated
                          </span>
                        )}
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.25)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                          }}
                        >
                          🟢 Open Today
                        </span>
                      </div>
                    </div>

                    {/* Store Title & Address */}
                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.25 }}>
                      {s.name}
                    </h3>

                    <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.88rem', margin: '0 0 1.15rem 0' }}>
                      📍 {s.address}
                    </p>

                    {/* Overall Rating Box */}
                    <div
                      style={{
                        background: 'var(--clay-recessed-bg)',
                        borderRadius: 'var(--radius-clay-inner)',
                        padding: '1rem 1.15rem',
                        marginBottom: '1rem',
                        boxShadow: 'var(--shadow-clay-pressed)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--clay-text-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          Community Score
                        </span>
                        <span style={{ color: hasReviews ? 'var(--clay-warning)' : 'var(--clay-text-dim)', fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                          {hasReviews ? `★ ${overallAvg.toFixed(2)}` : 'No ratings'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <span style={{ color: hasReviews ? 'var(--clay-warning)' : '#B8B2C4', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                          {hasReviews
                            ? '★'.repeat(Math.round(overallAvg)) + '☆'.repeat(5 - Math.round(overallAvg))
                            : '☆☆☆☆☆'}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clay-text-muted)' }}>
                          {hasReviews ? `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}` : '0 reviews'}
                        </span>
                      </div>
                    </div>

                    {/* User Rating Status Badge */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      {isUserRated ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span className="clay-badge clay-badge-green" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem 1rem' }}>
                            ⭐ You Rated: {s.user_rating} / 5 Stars
                          </span>
                          {s.my_comment && (
                            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--clay-text-muted)', fontStyle: 'italic', padding: '0 0.5rem' }}>
                              "{s.my_comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="clay-badge" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem 1rem', color: 'var(--clay-text-dim)' }}>
                          ⚪ Not Rated Yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating CTA Button */}
                  <div>
                    <Button
                      variant={isUserRated ? 'secondary' : 'primary'}
                      onClick={() => setSelectedStoreForRating(s)}
                      style={{ width: '100%' }}
                    >
                      {isUserRated ? '✏️ Modify Your Rating' : '⭐ Submit Star Rating'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW WITH CATEGORY BADGES */
          <div className="clay-table-wrapper" style={{ marginBottom: '2.5rem' }}>
            <table className="clay-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                    Store Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th>Sector</th>
                  <th onClick={() => handleSortToggle('address')} style={{ cursor: 'pointer' }}>
                    Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSortToggle('rating')} style={{ cursor: 'pointer' }}>
                    Community Score {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSortToggle('user_rating')} style={{ cursor: 'pointer' }}>
                    Your Rating {sort.sortBy === 'user_rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => {
                  const overallAvg = parseFloat(s.overall_rating || s.average_rating || 0);
                  const reviewCount = s.rating_count || 0;
                  const hasReviews = reviewCount > 0 && overallAvg > 0;
                  const isUserRated = s.user_rating !== null && s.user_rating !== undefined;
                  const catDetails = getStoreCategoryDetails(s.name, s.email);

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{catDetails.icon}</span>
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="clay-badge clay-badge-purple" style={{ fontSize: '0.75rem' }}>
                          {catDetails.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--clay-text-muted)' }}>
                        {s.address}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {hasReviews ? (
                            <>
                              <span style={{ color: 'var(--clay-warning)', fontWeight: 900 }}>
                                ★ {overallAvg.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
                                ({reviewCount})
                              </span>
                            </>
                          ) : (
                            <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem' }}>
                              No ratings
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isUserRated ? (
                          <span className="clay-badge clay-badge-green">
                            ⭐ {s.user_rating} / 5
                          </span>
                        ) : (
                          <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem' }}>
                            ⚪ Not Rated
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant={isUserRated ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => setSelectedStoreForRating(s)}
                        >
                          {isUserRated ? '✏️ Modify' : '⭐ Submit'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {stores.length > 0 && (
          <div className="clay-table-wrapper" style={{ borderRadius: 'var(--radius-clay-card)', overflow: 'hidden' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              totalItems={pagination.totalItems}
              onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
              onPageSizeChange={(newSize) => setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
              pageSizeOptions={[3, 6, 12, 24]}
            />
          </div>
        )}

        {/* Rate / Modify Store Modal */}
        <RateStoreModal
          isOpen={!!selectedStoreForRating}
          onClose={() => setSelectedStoreForRating(null)}
          store={selectedStoreForRating}
          onRatingSubmitted={handleRatingSuccess}
        />
      </div>
    </div>
  );
};
