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
  const [replyModalTarget, setReplyModalTarget] = useState(null);

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

  const handleReplySubmitted = ({ ratingId, ownerReply, ownerRepliedAt }) => {
    setRatings((prev) =>
      prev.map((r) =>
        r.id === ratingId
          ? { ...r, owner_reply: ownerReply, owner_replied_at: ownerRepliedAt }
          : r
      )
    );
    setSuccessMsg('Your official merchant reply was published successfully.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStatistics();
      setLoading(false);
    };
    init();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

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
      <div className="clay-page">
        <div className="clay-container">
          <div className="clay-grid-3" style={{ marginBottom: '2.5rem' }}>
            <SkeletonCard count={3} />
          </div>
          <SkeletonTable rows={6} cols={6} />
        </div>
      </div>
    );
  }

  const stores = statsData?.stores || [];
  const currentStore = selectedStoreId
    ? stores.find((s) => s.storeId === selectedStoreId)
    : null;

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

  // Sentiment Breakdown (Positive: 4-5★, Neutral: 3★, Attention: 1-2★)
  const totalR = activeStats.totalRatings || 0;
  const posCount = (activeStats.distribution[5] || 0) + (activeStats.distribution[4] || 0);
  const neuCount = activeStats.distribution[3] || 0;
  const negCount = (activeStats.distribution[2] || 0) + (activeStats.distribution[1] || 0);

  const posPct = totalR > 0 ? Math.round((posCount / totalR) * 100) : 0;
  const neuPct = totalR > 0 ? Math.round((neuCount / totalR) * 100) : 0;
  const negPct = totalR > 0 ? Math.max(0, 100 - posPct - neuPct) : 0;

  return (
    <div className="clay-page">
      <div className="clay-container">
        {/* Header Banner */}
        <div
          className="clay-card clay-card-hero"
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', margin: 0, fontWeight: 900 }}>
                🏪 Merchant Analytics Console
              </h1>
              <span className="clay-badge clay-badge-pink">STORE_OWNER</span>
            </div>
            <p style={{ color: 'var(--clay-text-muted)', margin: 0, fontSize: '1rem' }}>
              Real-time customer rating metrics, sentiment index, and review response center.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {stores.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-dim)', fontWeight: 700 }}>STORE:</span>
                <select
                  className="clay-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  style={{ minHeight: '44px', padding: '0.4rem 0.85rem' }}
                >
                  <option value="">All Managed Stores ({stores.length})</option>
                  {stores.map((st) => (
                    <option key={st.storeId} value={st.storeId}>
                      {st.storeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleManualRefresh}
              loading={refreshing}
              style={{ minHeight: '44px' }}
            >
              🔄 Refresh Telemetry
            </Button>

            <Button
              variant="primary"
              onClick={() => setShowPasswordModal(true)}
              style={{ minHeight: '44px' }}
            >
              🔒 Change Password
            </Button>
          </div>
        </div>

        {successMsg && (
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
        )}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* SECTION 1: STORE SUMMARY KPI CARDS */}
        <div className="clay-grid-3" style={{ marginBottom: '2.5rem' }}>
          {/* Store Info Card */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="clay-badge clay-badge-purple">STORE PROFILE</span>
                <div className="clay-orb clay-orb-purple" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
                  🏪
                </div>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
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
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
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
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              Precision: {activeStats.averageRatingOneDecimal} ★ (Calculated live from ratings)
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
            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '2px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              One-Rating-Per-User Rule Active
            </div>
          </Card>
        </div>

        {/* SECTION 2: SENTIMENT METER & STAR DISTRIBUTION */}
        <div className="clay-grid-2" style={{ marginBottom: '2.5rem' }}>
          {/* Sentiment Meter Card */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 900 }}>
                  😍 Customer Sentiment Index
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.9rem' }}>
                  Positive vs. Neutral vs. Critical feedback ratio.
                </p>
              </div>
              <span className="clay-badge clay-badge-green">
                {posPct}% Satisfaction
              </span>
            </div>

            {/* Three-Tier Visual Sentiment Bar */}
            <div className="clay-sentiment-meter">
              {posPct > 0 && (
                <div
                  className="clay-sentiment-segment clay-sentiment-positive"
                  style={{ width: `${posPct}%` }}
                  title={`Positive (4-5★): ${posCount} (${posPct}%)`}
                />
              )}
              {neuPct > 0 && (
                <div
                  className="clay-sentiment-segment clay-sentiment-neutral"
                  style={{ width: `${neuPct}%` }}
                  title={`Neutral (3★): ${neuCount} (${neuPct}%)`}
                />
              )}
              {negPct > 0 && (
                <div
                  className="clay-sentiment-segment clay-sentiment-negative"
                  style={{ width: `${negPct}%` }}
                  title={`Needs Attention (1-2★): ${negCount} (${negPct}%)`}
                />
              )}
            </div>

            {/* Sentiment Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--clay-recessed-bg)', padding: '0.75rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clay-success)', fontWeight: 800, display: 'block' }}>
                  😍 Positive (4-5★)
                </span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                  {posCount} ({posPct}%)
                </strong>
              </div>

              <div style={{ background: 'var(--clay-recessed-bg)', padding: '0.75rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clay-warning)', fontWeight: 800, display: 'block' }}>
                  😐 Neutral (3★)
                </span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                  {neuCount} ({neuPct}%)
                </strong>
              </div>

              <div style={{ background: 'var(--clay-recessed-bg)', padding: '0.75rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clay-danger)', fontWeight: 800, display: 'block' }}>
                  🙁 Attention (1-2★)
                </span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                  {negCount} ({negPct}%)
                </strong>
              </div>
            </div>
          </Card>

          {/* Star Distribution Breakdown */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 900 }}>
                  📈 Star Score Breakdown
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.9rem' }}>
                  Ratings frequency across 1 to 5 star ratings.
                </p>
              </div>
              <span className="clay-badge clay-badge-purple">
                {activeStats.totalRatings} Total
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = activeStats.distribution[stars] || 0;
                const pct = activeStats.distributionPercentages[stars] || 0;

                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '60px', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--clay-text-primary)' }}>
                      {stars} ★
                    </span>

                    <div
                      style={{
                        flex: 1,
                        height: '14px',
                        background: 'var(--clay-recessed-bg)',
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
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>

                    <div style={{ width: '100px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--clay-text-muted)', fontWeight: 700 }}>
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
              borderBottom: '2px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.5)',
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
                  👥 Customer Reviews &amp; Response Center
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.9rem' }}>
                  Read customer feedback, inspect reviewer profiles, and publish official merchant responses.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ width: '280px' }}>
                  <input
                    type="text"
                    className="clay-input"
                    placeholder="Search reviewer / store..."
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
                  {showAdvancedFilters ? '▲ Hide Filters' : '▼ Specific Filters'}
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
                  borderTop: '2px solid var(--border-subtle)',
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
            <SkeletonTable rows={5} cols={6} />
          ) : ratings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px', fontSize: '1.5rem' }}>
                💬
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900 }}>
                {activeFiltersCount > 0 ? 'No Matching Reviewers Found' : 'No customer ratings yet.'}
              </h4>
              <p style={{ color: 'var(--clay-text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem' }}>
                {activeFiltersCount > 0
                  ? 'No customer reviews match your active filters. Try clearing your query.'
                  : 'Customer ratings and feedback will appear here as soon as they are submitted.'}
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
                  <th onClick={() => handleSortToggle('email')} style={{ cursor: 'pointer' }}>
                    Email {sort.sortBy === 'email' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSortToggle('address')} style={{ cursor: 'pointer' }}>
                    Address {sort.sortBy === 'address' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  {stores.length > 1 && !selectedStoreId && (
                    <th>Store</th>
                  )}
                  <th onClick={() => handleSortToggle('rating')} style={{ cursor: 'pointer' }}>
                    Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'ASC' ? '▲' : '▼') : ''}
                  </th>
                  <th>Customer Feedback &amp; Merchant Reply</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: 'var(--clay-text-primary)' }}>
                      {r.user?.name || 'Customer User'}
                    </td>
                    <td style={{ color: 'var(--clay-text-muted)' }}>
                      {r.user?.email || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--clay-text-muted)', fontSize: '0.85rem' }}>
                      {r.user?.address || 'N/A'}
                    </td>
                    {stores.length > 1 && !selectedStoreId && (
                      <td style={{ color: 'var(--clay-text-muted)', fontSize: '0.85rem' }}>
                        {r.store_name}
                      </td>
                    )}
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
                    <td style={{ maxWidth: '320px' }}>
                      {r.comment ? (
                        <p style={{ margin: '0 0 0.35rem 0', fontStyle: 'italic', color: 'var(--clay-text-primary)', fontSize: '0.9rem' }}>
                          "{r.comment}"
                        </p>
                      ) : (
                        <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem' }}>No written feedback</span>
                      )}

                      {/* Official Merchant Reply Bubble */}
                      {r.owner_reply && (
                        <div className="clay-owner-reply-box">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--clay-accent-primary)', textTransform: 'uppercase' }}>
                              🏬 Merchant Reply
                            </span>
                            {r.owner_replied_at && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--clay-text-dim)' }}>
                                • {new Date(r.owner_replied_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--clay-text-primary)' }}>
                            {r.owner_reply}
                          </p>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant={r.owner_reply ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => setReplyModalTarget(r)}
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

        {/* Store Owner Reply Modal */}
        <OwnerReplyModal
          isOpen={!!replyModalTarget}
          onClose={() => setReplyModalTarget(null)}
          rating={replyModalTarget}
          onReplySubmitted={handleReplySubmitted}
        />
      </div>
    </div>
  );
};
