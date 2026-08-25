import React, { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { ratingService } from '../../services/ratingService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Pagination } from '../common/Pagination';
import { SkeletonCard } from '../common/SkeletonCard';
import { SkeletonTable } from '../common/SkeletonTable';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { OwnerReplyModal } from '../common/OwnerReplyModal';
import { useDebounce } from '../../hooks/useDebounce';

export const StoreOwnerDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Reply Modal state
  const [selectedRatingForReply, setSelectedRatingForReply] = useState(null);

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

  // 2. Fetch Customer Reviewers List
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
      setError(
        err.response?.data?.message ||
        'Failed to load customer ratings table.'
      );
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

  // Reset pagination on filter or store switch
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

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchStatistics(), fetchRatings()]);
      setLoading(false);
    };
    initData();
  }, [fetchStatistics, fetchRatings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatistics(), fetchRatings()]);
    setRefreshing(false);
    setSuccessMsg('Dashboard telemetry and reviews refreshed!');
  };

  const handleSortToggle = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setNameInput('');
    setEmailInput('');
    setAddressInput('');
    setRatingScoreFilter('');
    setSort({ sortBy: 'created_at', sortOrder: 'DESC' });
  };

  const handleReplySaved = ({ ratingId, ownerReply, ownerRepliedAt }) => {
    setRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, owner_reply: ownerReply, owner_replied_at: ownerRepliedAt } : r))
    );
    setSuccessMsg('Your official merchant reply has been published successfully!');
  };

  if (loading) {
    return (
      <div className="clay-page">
        <div className="clay-container">
          <div className="clay-grid-3" style={{ marginBottom: '2rem' }}>
            <SkeletonCard count={3} />
          </div>
          <SkeletonTable rows={5} columns={6} />
        </div>
      </div>
    );
  }

  const stores = statsData?.stores || [];
  const activeStats = statsData?.activeStore || {
    name: 'Your Store',
    address: 'N/A',
    email: 'N/A',
    totalRatings: 0,
    averageRating: '0.00',
    averageRatingOneDecimal: '0.0',
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    distributionPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const avgNum = parseFloat(activeStats.averageRating || 0);

  // Calculate Sentiment Breakdown (4-5 = Positive, 3 = Neutral, 1-2 = Attention)
  const dist = activeStats.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalR = activeStats.totalRatings || 0;
  const positiveCount = (dist[5] || 0) + (dist[4] || 0);
  const neutralCount = dist[3] || 0;
  const criticalCount = (dist[2] || 0) + (dist[1] || 0);

  const positivePct = totalR > 0 ? Math.round((positiveCount / totalR) * 100) : 0;
  const neutralPct = totalR > 0 ? Math.round((neutralCount / totalR) * 100) : 0;
  const criticalPct = totalR > 0 ? 100 - positivePct - neutralPct : 0;

  return (
    <div className="clay-page">
      <div className="clay-container">
        {/* Top Header & Quick Actions */}
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
              COMMERCIAL OPERATOR CONSOLE
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', margin: 0, fontWeight: 900 }}>
              🏬 Store Owner Telemetry &amp; Reviews
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              loading={refreshing}
              style={{ minHeight: '44px' }}
            >
              🔄 Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowPasswordModal(true)}
              style={{ minHeight: '44px' }}
            >
              🔒 Security Settings
            </Button>
          </div>
        </div>

        {successMsg && (
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
        )}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Multi-Store Switcher (if owner manages >1 store) */}
        {stores.length > 1 && (
          <Card style={{ marginBottom: '2rem', padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="clay-orb clay-orb-blue" style={{ width: '40px', height: '40px', fontSize: '1.15rem' }}>
                  🏪
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    Select Managed Store
                  </h4>
                  <span style={{ color: 'var(--clay-text-muted)', fontSize: '0.85rem' }}>
                    Switch telemetry between your registered establishments
                  </span>
                </div>
              </div>

              <div style={{ minWidth: '280px' }}>
                <select
                  className="clay-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(e.target.value ? parseInt(e.target.value, 10) : null)}
                >
                  <option value="">All Stores Combined ({stores.length})</option>
                  {stores.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.total_ratings || 0} reviews)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* SECTION 1: 3 KPI CARDS */}
        <div className="clay-grid-3" style={{ marginBottom: '2rem' }}>
          {/* Store Profile Card */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="clay-badge clay-badge-purple">COMMERCIAL IDENTITY</span>
                <div className="clay-orb clay-orb-purple" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
                  🏢
                </div>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.25 }}>
                {activeStats.name}
              </h3>
              <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                📍 {activeStats.address}
              </p>
              {activeStats.email && (
                <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  ✉️ {activeStats.email}
                </p>
              )}
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              Verified Commercial Listing
            </div>
          </Card>

          {/* Average Rating KPI Card */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="clay-badge clay-badge-amber">OVERALL SCORE</span>
                <div className="clay-orb clay-orb-amber" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
                  ⭐
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-warning)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                  {activeStats.averageRating}
                </span>
                <span style={{ fontSize: '1.25rem', color: 'var(--clay-text-dim)', fontWeight: 700 }}>/ 5.0</span>
              </div>

              <div style={{ color: avgNum > 0 ? 'var(--clay-warning)' : '#B8B2C4', fontSize: '1.35rem', letterSpacing: '0.15em' }}>
                {avgNum > 0
                  ? '★'.repeat(Math.round(avgNum)) + '☆'.repeat(5 - Math.round(avgNum))
                  : '☆☆☆☆☆'}
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              Precision: {activeStats.averageRatingOneDecimal} ★
            </div>
          </Card>

          {/* Total Ratings KPI Card */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="clay-badge clay-badge-blue">TOTAL REVIEWS</span>
                <div className="clay-orb clay-orb-blue" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
                  👥
                </div>
              </div>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-accent-primary)', lineHeight: 1, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                {activeStats.totalRatings}
              </div>
              <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>
                {activeStats.totalRatings === 1 ? '1 verified customer rating' : `${activeStats.totalRatings} verified customer ratings`}
              </p>
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              One-Rating-Per-User Enforced
            </div>
          </Card>
        </div>

        {/* SECTION 2: SENTIMENT METER & RATING DISTRIBUTION */}
        <div className="clay-grid-2" style={{ marginBottom: '2.5rem' }}>
          {/* Customer Sentiment Meter */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 900 }}>
                  🎭 Customer Sentiment Meter
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.88rem' }}>
                  Real-time sentiment breakdown of customer feedback
                </p>
              </div>
            </div>

            <div className="sentiment-bar-track">
              <div className="sentiment-seg-positive" style={{ width: `${positivePct}%` }} title={`Positive: ${positivePct}%`} />
              <div className="sentiment-seg-neutral" style={{ width: `${neutralPct}%` }} title={`Neutral: ${neutralPct}%`} />
              <div className="sentiment-seg-critical" style={{ width: `${criticalPct}%` }} title={`Needs Attention: ${criticalPct}%`} />
            </div>

            <div className="sentiment-legend">
              <span style={{ color: 'var(--clay-success)' }}>
                😍 Positive (4-5★): <strong>{positivePct}%</strong> ({positiveCount})
              </span>
              <span style={{ color: 'var(--clay-warning)' }}>
                😐 Neutral (3★): <strong>{neutralPct}%</strong> ({neutralCount})
              </span>
              <span style={{ color: 'var(--clay-danger)' }}>
                🙁 Attention (1-2★): <strong>{criticalPct}%</strong> ({criticalCount})
              </span>
            </div>
          </Card>

          {/* Star Rating Distribution */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 900 }}>
                  📈 Star Distribution Breakdown
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.88rem' }}>
                  Exact counts across 1 to 5 star ratings
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = activeStats.distribution[stars] || 0;
                const pct = activeStats.distributionPercentages[stars] || 0;

                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ width: '60px', fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--clay-text-primary)' }}>
                      {stars} Stars
                    </span>

                    <div
                      style={{
                        flex: 1,
                        height: '12px',
                        background: 'var(--clay-input-bg)',
                        borderRadius: '9999px',
                        boxShadow: 'var(--shadow-clay-pressed)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background:
                            stars >= 4
                              ? 'var(--clay-gradient-emerald)'
                              : stars === 3
                              ? 'var(--clay-gradient-amber)'
                              : 'var(--clay-gradient-secondary)',
                          borderRadius: '9999px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>

                    <div style={{ width: '90px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--clay-text-muted)', fontWeight: 700 }}>
                      <strong>{count}</strong> ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* SECTION 3: USERS WHO RATED THE STORE & OWNER REPLY ACTIONS */}
        <div className="clay-table-wrapper" style={{ marginBottom: '2.5rem' }}>
          {/* Table Header & Search Filter Bar */}
          <div
            style={{
              padding: '1.5rem 1.75rem',
              borderBottom: '2px solid rgba(124, 58, 237, 0.08)',
              background: 'var(--clay-card-bg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 900 }}>
                  💬 Customer Reviews &amp; Direct Response Thread
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.9rem' }}>
                  Engage directly with customers by publishing official store owner replies.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ width: '280px' }}>
                  <input
                    type="text"
                    className="clay-input"
                    placeholder="Search reviewer / comment..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  style={{ minHeight: '44px' }}
                >
                  {showAdvancedFilters ? '▲ Hide' : '▼ More Filters'}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleClearFilters}
                    style={{ minHeight: '44px' }}
                  >
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Collapsible Specific Multi-Field Filters */}
            {showAdvancedFilters && (
              <div
                className="clay-grid-4"
                style={{
                  gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '2px solid rgba(124, 58, 237, 0.08)',
                }}
              >
                <div>
                  <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                    FILTER BY USER NAME
                  </label>
                  <input
                    type="text"
                    className="clay-input"
                    placeholder="e.g. Sarah"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <div>
                  <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                    FILTER BY USER EMAIL
                  </label>
                  <input
                    type="text"
                    className="clay-input"
                    placeholder="e.g. @example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <div>
                  <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                    FILTER BY ADDRESS
                  </label>
                  <input
                    type="text"
                    className="clay-input"
                    placeholder="e.g. Terrace or Sector"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <div>
                  <label className="clay-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                    FILTER BY STAR SCORE
                  </label>
                  <select
                    className="clay-select"
                    value={ratingScoreFilter}
                    onChange={(e) => setRatingScoreFilter(e.target.value)}
                    style={{ minHeight: '42px' }}
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
            <SkeletonTable rows={5} columns={6} />
          ) : ratings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px', fontSize: '1.5rem' }}>
                💬
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900 }}>
                {activeFiltersCount > 0 ? 'No Matching Reviewers Found' : 'No ratings yet.'}
              </h4>
              <p style={{ color: 'var(--clay-text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem' }}>
                {activeFiltersCount > 0
                  ? 'No customer reviews match your active filters. Try clearing your query.'
                  : 'Ratings will appear here once customers submit them.'}
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Reset Search Filters
                </Button>
              )}
            </div>
          ) : (
            <table className="clay-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                    Customer {sort.sortBy === 'name' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSortToggle('rating')} style={{ cursor: 'pointer' }}>
                    Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSortToggle('created_at')} style={{ cursor: 'pointer' }}>
                    Date {sort.sortBy === 'created_at' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th>Feedback &amp; Owner Response</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                        {r.user?.name || 'Customer User'}
                      </div>
                      <div style={{ color: 'var(--clay-text-dim)', fontSize: '0.8rem' }}>
                        {r.user?.email || 'N/A'} • {r.user?.address || 'Springfield'}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`clay-badge ${
                          r.rating_value >= 4
                            ? 'clay-badge-green'
                            : r.rating_value === 3
                            ? 'clay-badge-amber'
                            : 'clay-badge-pink'
                        }`}
                      >
                        ⭐ {r.rating_value} / 5
                      </span>
                    </td>
                    <td style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ maxWidth: '380px' }}>
                      {r.comment ? (
                        <div style={{ fontStyle: 'italic', color: 'var(--clay-text-primary)', fontSize: '0.9rem', marginBottom: r.owner_reply ? '0.4rem' : '0' }}>
                          "{r.comment}"
                        </div>
                      ) : (
                        <div style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem', marginBottom: r.owner_reply ? '0.4rem' : '0' }}>
                          (Score submitted without comment)
                        </div>
                      )}

                      {r.owner_reply && (
                        <div className="clay-owner-reply-box" style={{ padding: '0.65rem 0.85rem', marginTop: '0.35rem' }}>
                          <div className="clay-owner-reply-header" style={{ fontSize: '0.78rem' }}>
                            <span>💬 Your Official Reply:</span>
                          </div>
                          <p className="clay-owner-reply-text" style={{ fontSize: '0.85rem' }}>
                            "{r.owner_reply}"
                          </p>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant={r.owner_reply ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => setSelectedRatingForReply(r)}
                      >
                        {r.owner_reply ? '✏️ Edit Reply' : '💬 Reply'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          {ratingsPagination.totalItems > 0 && (
            <Pagination
              currentPage={ratingsPagination.page}
              totalPages={ratingsPagination.totalPages}
              pageSize={ratingsPagination.limit}
              totalItems={ratingsPagination.totalItems}
              onPageChange={(newPage) => setRatingsPagination((prev) => ({ ...prev, page: newPage }))}
              onPageSizeChange={(newSize) => setRatingsPagination((prev) => ({ ...prev, limit: newSize, page: 1 }))}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        {/* Owner Reply Modal */}
        <OwnerReplyModal
          isOpen={!!selectedRatingForReply}
          onClose={() => setSelectedRatingForReply(null)}
          rating={selectedRatingForReply}
          onReplySaved={handleReplySaved}
        />
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
