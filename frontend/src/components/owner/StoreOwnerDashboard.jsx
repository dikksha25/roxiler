import React, { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { ratingService } from '../../services/ratingService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

export const StoreOwnerDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null); // null = all / aggregate

  // Ratings Table state
  const [ratings, setRatings] = useState([]);
  const [ratingsPagination, setRatingsPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [ratingScoreFilter, setRatingScoreFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced filters
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedAddress = useDebounce(addressInput, 300);

  const [sort, setSort] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const activeFiltersCount = [
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
    ratingScoreFilter,
  ].filter(Boolean).length;

  // 1. Fetch Store Owner Statistics & Metrics
  const fetchStatistics = useCallback(async () => {
    try {
      setError(null);
      const res = await dashboardService.getStoreOwnerStatistics(selectedStoreId);
      if (res && res.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load store owner statistics. Please verify your connection or re-login.'
      );
    }
  }, [selectedStoreId]);

  // 2. Fetch Customer Reviewers List with Pagination & Multi-field Filtering
  const fetchRatings = useCallback(async () => {
    setRatingsLoading(true);
    try {
      const params = {
        page: ratingsPagination.page,
        limit: ratingsPagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        search: debouncedSearch || undefined,
        name: debouncedName || undefined,
        email: debouncedEmail || undefined,
        address: debouncedAddress || undefined,
        rating: ratingScoreFilter || undefined,
        storeId: selectedStoreId || undefined,
      };

      const res = await ratingService.getOwnerRatings(params);
      if (res && res.data) {
        setRatings(res.data.ratings || []);
        if (res.pagination) {
          setRatingsPagination((prev) => ({
            ...prev,
            totalItems: res.pagination.totalItems,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load customer ratings list', err);
    } finally {
      setRatingsLoading(false);
    }
  }, [
    ratingsPagination.page,
    ratingsPagination.limit,
    sort.sortBy,
    sort.sortOrder,
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
    ratingScoreFilter,
    selectedStoreId,
  ]);

  // Combined Refresh Handler
  const handleManualRefresh = async () => {
    setRefreshing(true);
    setSuccessMsg(null);
    try {
      await Promise.all([fetchStatistics(), fetchRatings()]);
      setSuccessMsg('Store telemetry and customer feedback refreshed successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Error refreshing store telemetry.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setNameInput('');
    setEmailInput('');
    setAddressInput('');
    setRatingScoreFilter('');
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStatistics();
      setLoading(false);
    };
    init();
  }, [fetchStatistics]);

  // Refetch ratings when filters/pagination change
  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Reset pagination on filter / sort change
  useEffect(() => {
    setRatingsPagination((prev) => ({ ...prev, page: 1 }));
  }, [
    debouncedSearch,
    debouncedName,
    debouncedEmail,
    debouncedAddress,
    ratingScoreFilter,
    selectedStoreId,
    sort,
  ]);

  const handleSortToggle = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <Spinner size={45} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Loading your live store telemetry and customer ratings...
        </p>
      </div>
    );
  }

  const stores = statsData?.stores || [];
  const currentStore = selectedStoreId
    ? stores.find((s) => s.storeId === selectedStoreId)
    : null;

  // Active statistics context (either specific store or aggregate)
  const activeStats = currentStore
    ? {
        name: currentStore.storeName,
        email: currentStore.storeEmail,
        address: currentStore.storeAddress,
        averageRating: currentStore.averageRating,
        averageRatingOneDecimal: currentStore.averageRatingOneDecimal,
        totalRatings: currentStore.totalRatings,
        distribution: currentStore.distribution,
        distributionPercentages: currentStore.distributionPercentages,
      }
    : {
        name: stores.length === 1 ? stores[0].storeName : 'All Managed Stores Portfolio',
        email: stores.length === 1 ? stores[0].storeEmail : statsData?.owner?.email,
        address: stores.length === 1 ? stores[0].storeAddress : `${stores.length} Registered Stores`,
        averageRating: statsData?.overall?.averageRating || '0.00',
        averageRatingOneDecimal: statsData?.overall?.averageRatingOneDecimal || '0.0',
        totalRatings: statsData?.overall?.totalRatings || 0,
        distribution: statsData?.overall?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        distributionPercentages: statsData?.overall?.distributionPercentages || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

  const avgNum = parseFloat(activeStats.averageRating || 0);

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.85rem', margin: 0, letterSpacing: '-0.02em' }}>
              🏪 Store Owner Management Console
            </h1>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              STORE_OWNER
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Monitor real-time store performance, rating distributions, and customer review feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Multi-Store Switcher */}
          {stores.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>STORE:</span>
              <select
                className="input-field"
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(e.target.value ? parseInt(e.target.value, 10) : null)}
                style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
              >
                <option value="">All Stores Aggregate ({stores.length})</option>
                {stores.map((st) => (
                  <option key={st.storeId} value={st.storeId}>
                    {st.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Refresh Action */}
          <Button
            variant="secondary"
            onClick={handleManualRefresh}
            loading={refreshing}
            style={{ fontSize: '0.85rem' }}
          >
            🔄 Refresh Data
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* SECTION 1: STORE INFORMATION & SUMMARY KPI CARDS */}
      <div className="grid grid-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Store Info Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Store Information
              </span>
              <span style={{ fontSize: '1.25rem' }}>🏪</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              {activeStats.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              📍 {activeStats.address}
            </p>
            {activeStats.email && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                ✉️ {activeStats.email}
              </p>
            )}
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Verified Commercial Listing
          </div>
        </Card>

        {/* Average Rating KPI Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Average Overall Rating
              </span>
              <span style={{ fontSize: '1.25rem' }}>⭐</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: avgNum > 0 ? '#f59e0b' : 'var(--text-dim)', lineHeight: 1 }}>
                {activeStats.averageRating}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>

            {/* Star Visualizer */}
            <div style={{ color: avgNum > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: '1.15rem', letterSpacing: '2px' }}>
              {avgNum > 0
                ? '★'.repeat(Math.round(avgNum)) + '☆'.repeat(5 - Math.round(avgNum))
                : '☆☆☆☆☆'}
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Precision: {activeStats.averageRatingOneDecimal} ★ (Calculated from verified reviews)
          </div>
        </Card>

        {/* Total Ratings KPI Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Total Ratings Received
              </span>
              <span style={{ fontSize: '1.25rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {activeStats.totalRatings}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              {activeStats.totalRatings === 1 ? '1 verified customer rating' : `${activeStats.totalRatings} verified customer ratings`}
            </p>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            One-Rating-Per-User Rule Active
          </div>
        </Card>
      </div>

      {/* SECTION 2: RATING DISTRIBUTION BREAKDOWN */}
      <Card style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>📈 Rating Score Distribution</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Breakdown of customer ratings across 1 to 5 star ratings.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Total: {activeStats.totalRatings} Reviews
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = activeStats.distribution[stars] || 0;
            const pct = activeStats.distributionPercentages[stars] || 0;

            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '60px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {stars} Stars
                </span>

                {/* Progress Bar Container */}
                <div
                  style={{
                    flex: 1,
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background:
                        stars >= 4
                          ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          : stars === 3
                          ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>

                <div style={{ width: '120px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>{count}</strong> ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SECTION 3: USERS WHO RATED THE STORE (INTERACTIVE TABLE) */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Table Header & Search Filter Bar */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>👥 Customer Reviewers Feed</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Full list of verified customers who submitted reviews for your store.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '260px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Global search reviewer / store..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                style={{ fontSize: '0.85rem' }}
              >
                {showAdvancedFilters ? '▲ Hide Filters' : '▼ Specific Filters'}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  style={{ fontSize: '0.85rem' }}
                >
                  Clear ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Specific Multi-Field Filters */}
          {showAdvancedFilters && (
            <div
              className="grid grid-4 fade-in"
              style={{
                gap: '0.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                  FILTER BY USER NAME
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sarah"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                  FILTER BY USER EMAIL
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. @example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
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
                  placeholder="e.g. Terrace or Sector"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{ fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                  FILTER BY STAR SCORE
                </label>
                <select
                  className="input-field"
                  value={ratingScoreFilter}
                  onChange={(e) => setRatingScoreFilter(e.target.value)}
                  style={{ fontSize: '0.85rem', width: '100%' }}
                >
                  <option value="">All Scores (1–5)</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="1">⭐ 1 Star</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        {ratingsLoading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Spinner size={35} />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading reviewer records...
            </p>
          </div>
        ) : ratings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>💬</span>
            <h4 style={{ margin: '0 0 0.35rem 0' }}>
              {activeFiltersCount > 0 ? 'No Matching Reviewers Found' : 'No ratings yet.'}
            </h4>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1rem auto', fontSize: '0.85rem' }}>
              {activeFiltersCount > 0
                ? 'No customer reviews match your active search filters. Try clearing or relaxing your query.'
                : 'Your store has not received any customer ratings yet. Ratings will appear here once customers submit them.'}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="secondary" onClick={handleClearFilters} style={{ fontSize: '0.85rem' }}>
                Reset Search Filters
              </Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th
                    style={{ padding: '0.85rem 1.25rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('name')}
                  >
                    User Name {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1.25rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('email')}
                  >
                    User Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1.25rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('address')}
                  >
                    User Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  {stores.length > 1 && !selectedStoreId && (
                    <th style={{ padding: '0.85rem 1.25rem' }}>Store Name</th>
                  )}
                  <th
                    style={{ padding: '0.85rem 1.25rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('rating')}
                  >
                    Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    style={{ padding: '0.85rem 1.25rem', cursor: 'pointer' }}
                    onClick={() => handleSortToggle('created_at')}
                  >
                    Rating Date {sort.sortBy === 'created_at' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Feedback Comment</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.user?.name || 'Customer User'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>
                      {r.user?.email || 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '200px' }}>
                      {r.user?.address || 'N/A'}
                    </td>
                    {stores.length > 1 && !selectedStoreId && (
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {r.store_name}
                      </td>
                    )}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span
                        style={{
                          background:
                            r.rating_value >= 4
                              ? 'rgba(16, 185, 129, 0.15)'
                              : r.rating_value === 3
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            r.rating_value >= 4
                              ? 'var(--accent-success)'
                              : r.rating_value === 3
                              ? 'var(--accent-warning)'
                              : 'var(--accent-danger)',
                          border: '1px solid currentColor',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        ⭐ {r.rating_value} / 5
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '250px' }}>
                      {r.comment ? (
                        <span style={{ fontStyle: 'italic' }}>"{r.comment}"</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>No written comment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {ratingsPagination.totalItems > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <Pagination
              currentPage={ratingsPagination.page}
              totalPages={ratingsPagination.totalPages}
              pageSize={ratingsPagination.limit}
              totalItems={ratingsPagination.totalItems}
              onPageChange={(newPage) => setRatingsPagination((prev) => ({ ...prev, page: newPage }))}
              onPageSizeChange={(newSize) => setRatingsPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
