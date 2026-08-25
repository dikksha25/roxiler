import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { UserManagementPage } from './UserManagementPage';
import { StoreManagementPage } from './StoreManagementPage';

// Helper for human-readable relative time formatting
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

export const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, stores, ratings
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getAdminStats();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <Spinner size={48} />
        <p style={{ marginTop: '1.25rem', color: 'var(--clay-text-muted)', fontSize: '1rem', fontWeight: 600 }}>
          Computing real-time platform metrics &amp; telemetry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <Alert type="error" message={error} />
        <div style={{ textAlign: 'center' }}>
          <Button variant="primary" onClick={fetchStats}>
            🔄 Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const { stats = {}, roleBreakdown = {}, recentRatings = [] } = data || {};

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
                🛡️ Platform Governance Console
              </h1>
              <span className="clay-badge clay-badge-purple">SUPER_ADMIN</span>
            </div>
            <p style={{ color: 'var(--clay-text-muted)', margin: 0, fontSize: '1rem' }}>
              System-wide metrics, sector distribution, user directory, and store registry.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button variant="secondary" onClick={fetchStats} title="Refresh live statistics" style={{ minHeight: '44px' }}>
              🔄 Refresh Stats
            </Button>
          </div>
        </div>

        {/* Primary Metric Cards Grid */}
        <div className="clay-grid-4" style={{ marginBottom: '2.5rem' }}>
          {/* Card 1: Total Users */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span className="clay-badge clay-badge-purple">TOTAL USERS</span>
              <div className="clay-orb clay-orb-purple" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                👥
              </div>
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-accent-primary)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {stats.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clay-text-dim)', marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontWeight: 700 }}>
              <span style={{ color: 'var(--clay-accent-primary)' }}>Admins: {roleBreakdown.adminCount || 0}</span> &bull;
              <span style={{ color: 'var(--clay-accent-secondary)' }}>Owners: {roleBreakdown.ownerCount || 0}</span> &bull;
              <span style={{ color: 'var(--clay-accent-tertiary)' }}>Users: {roleBreakdown.userCount || 0}</span>
            </div>
          </Card>

          {/* Card 2: Total Stores */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span className="clay-badge clay-badge-pink">TOTAL STORES</span>
              <div className="clay-orb clay-orb-pink" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                🏪
              </div>
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-accent-secondary)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {stats.totalStores || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clay-success)', marginTop: '0.75rem', fontWeight: 700 }}>
              ✓ All Registered &amp; Verified
            </div>
          </Card>

          {/* Card 3: Total Submitted Ratings */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span className="clay-badge clay-badge-amber">SUBMITTED RATINGS</span>
              <div className="clay-orb clay-orb-amber" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                ⭐
              </div>
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-warning)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {stats.totalRatings || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clay-text-muted)', marginTop: '0.75rem', fontWeight: 600 }}>
              From Verified Consumers
            </div>
          </Card>

          {/* Card 4: Platform Average Rating */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span className="clay-badge clay-badge-green">PLATFORM AVERAGE</span>
              <div className="clay-orb clay-orb-green" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                📈
              </div>
            </div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--clay-success)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {stats.averageRating || '0.00'} <span style={{ fontSize: '1.25rem' }}>★</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clay-success)', marginTop: '0.75rem', fontWeight: 700 }}>
              High Customer Satisfaction
            </div>
          </Card>
        </div>

        {/* Admin Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`clay-btn ${activeTab === 'overview' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
          >
            📊 Platform Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`clay-btn ${activeTab === 'users' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
          >
            👥 User Management ({stats.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`clay-btn ${activeTab === 'stores' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
          >
            🏪 Store Registry ({stats.totalStores || 0})
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`clay-btn ${activeTab === 'ratings' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
          >
            ⭐ Live Activity Feed ({stats.totalRatings || 0})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SECTOR DISTRIBUTION */}
        {activeTab === 'overview' && (
          <div className="clay-grid-2" style={{ gap: '2rem' }}>
            {/* Role Distribution Card */}
            <Card>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1.25rem' }}>👥 Role Distribution Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.45rem', fontWeight: 700 }}>
                    <span>🛡️ System Administrators</span>
                    <span style={{ color: 'var(--clay-accent-primary)' }}>{roleBreakdown.adminCount || 0}</span>
                  </div>
                  <div style={{ height: '14px', background: 'var(--clay-recessed-bg)', borderRadius: '9999px', boxShadow: 'var(--shadow-clay-pressed)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--clay-gradient-primary)', width: `${((roleBreakdown.adminCount || 0) / (stats.totalUsers || 1)) * 100}%`, borderRadius: '9999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.45rem', fontWeight: 700 }}>
                    <span>🏪 Store Owners</span>
                    <span style={{ color: 'var(--clay-accent-secondary)' }}>{roleBreakdown.ownerCount || 0}</span>
                  </div>
                  <div style={{ height: '14px', background: 'var(--clay-recessed-bg)', borderRadius: '9999px', boxShadow: 'var(--shadow-clay-pressed)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--clay-gradient-secondary)', width: `${((roleBreakdown.ownerCount || 0) / (stats.totalUsers || 1)) * 100}%`, borderRadius: '9999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.45rem', fontWeight: 700 }}>
                    <span>⭐ Normal Users (Consumers)</span>
                    <span style={{ color: 'var(--clay-accent-tertiary)' }}>{roleBreakdown.userCount || 0}</span>
                  </div>
                  <div style={{ height: '14px', background: 'var(--clay-recessed-bg)', borderRadius: '9999px', boxShadow: 'var(--shadow-clay-pressed)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--clay-gradient-tertiary)', width: `${((roleBreakdown.userCount || 0) / (stats.totalUsers || 1)) * 100}%`, borderRadius: '9999px' }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Sector / Retail Category Visual Chart */}
            <Card>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1.25rem' }}>🛍️ Retail Sector Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {[
                  { sector: 'Grocery & Organics', icon: '🥑', count: 1, color: 'var(--clay-gradient-emerald)', pct: 34 },
                  { sector: 'Cafe & Dining', icon: '☕', count: 1, color: 'var(--clay-gradient-amber)', pct: 33 },
                  { sector: 'Tech & Electronics', icon: '⚡', count: 1, color: 'var(--clay-gradient-primary)', pct: 33 },
                ].map((s) => (
                  <div key={s.sector}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem', fontWeight: 700 }}>
                      <span>{s.icon} {s.sector}</span>
                      <span style={{ color: 'var(--clay-text-muted)' }}>{s.count} Store ({s.pct}%)</span>
                    </div>
                    <div style={{ height: '12px', background: 'var(--clay-recessed-bg)', borderRadius: '9999px', boxShadow: 'var(--shadow-clay-pressed)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: s.color, width: `${s.pct}%`, borderRadius: '9999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && <UserManagementPage />}

        {/* TAB 3: STORE MANAGEMENT */}
        {activeTab === 'stores' && <StoreManagementPage />}

        {/* TAB 4: LIVE RATINGS ACTIVITY STREAM WITH RELATIVE TIMESTAMPS */}
        {activeTab === 'ratings' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 900 }}>
                  ⚡ Live Community Activity Stream
                </h3>
                <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.9rem' }}>
                  Real-time consumer reviews with verified ratings and merchant response status.
                </p>
              </div>
              <span className="clay-badge clay-badge-purple">
                Total Reviews: {stats.totalRatings || 0}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recentRatings.length === 0 ? (
                <p style={{ color: 'var(--clay-text-muted)' }}>No ratings submitted yet.</p>
              ) : (
                recentRatings.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'var(--clay-recessed-bg)',
                      boxShadow: 'var(--shadow-clay-pressed)',
                      borderRadius: 'var(--radius-clay-inner)',
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="clay-badge clay-badge-blue" style={{ fontSize: '0.75rem' }}>
                          👤 {r.user_name || `User #${r.user_id}`}
                        </span>
                        <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem' }}>reviewed</span>
                        <span className="clay-badge clay-badge-pink" style={{ fontSize: '0.75rem' }}>
                          🏪 {r.store_name || `Store #${r.store_id}`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: 'var(--clay-warning)', fontWeight: 900, fontSize: '1.15rem' }}>
                          {'★'.repeat(r.rating_value || r.rating || 5)}{'☆'.repeat(5 - (r.rating_value || r.rating || 5))}
                          <span style={{ marginLeft: '0.45rem', color: 'var(--clay-text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>
                            ({r.rating_value || r.rating}/5)
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
                          • {formatRelativeTime(r.created_at)}
                        </span>
                      </div>
                    </div>

                    {r.comment ? (
                      <p style={{ color: 'var(--clay-text-primary)', fontSize: '0.92rem', margin: '0.35rem 0 0 0', fontStyle: 'italic' }}>
                        "{r.comment}"
                      </p>
                    ) : (
                      <p style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
                        Customer gave star score without written text.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
