import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../common/Card';
import { Alert } from '../common/Alert';
import { Spinner } from '../common/Spinner';
import { UserManagementPage } from './UserManagementPage';
import { StoreManagementPage } from './StoreManagementPage';

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
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Spinner size={48} />
        <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
          Computing real-time platform metrics from database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <Alert type="error" message={error} />
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={fetchStats}>
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { stats = {}, roleBreakdown = {}, recentRatings = [] } = data || {};

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.85rem', margin: 0, letterSpacing: '-0.02em' }}>
              🛡️ System Administration Console
            </h1>
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              SUPER ADMIN
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            Live platform telemetry, user role governance, store directories, and real-time rating aggregations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={fetchStats} title="Refresh live statistics">
            🔄 Refresh Stats
          </button>
        </div>
      </div>

      {/* Primary Metric Cards Grid */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        {/* Card 1: Total Users */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              TOTAL USERS
            </span>
            <span style={{ fontSize: '1.25rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
            {stats.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#c084fc' }}>Admins: {roleBreakdown.adminCount || 0}</span> &bull;
            <span style={{ color: '#34d399' }}>Owners: {roleBreakdown.ownerCount || 0}</span> &bull;
            <span style={{ color: '#60a5fa' }}>Users: {roleBreakdown.userCount || 0}</span>
          </div>
        </Card>

        {/* Card 2: Total Stores */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              TOTAL STORES
            </span>
            <span style={{ fontSize: '1.25rem' }}>🏪</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '0.25rem' }}>
            {stats.totalStores || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '0.5rem' }}>
            ✓ All Registered & Listed
          </div>
        </Card>

        {/* Card 3: Total Submitted Ratings */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              SUBMITTED RATINGS
            </span>
            <span style={{ fontSize: '1.25rem' }}>⭐</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '0.25rem' }}>
            {stats.totalRatings || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            From Normal Users
          </div>
        </Card>

        {/* Card 4: Platform Average Rating */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              PLATFORM AVERAGE
            </span>
            <span style={{ fontSize: '1.25rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {stats.averageRating || '0.00'} <span style={{ fontSize: '1.25rem' }}>★</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '0.5rem' }}>
            High Customer Satisfaction
          </div>
        </Card>
      </div>

      {/* Admin Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          📊 Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          👥 User Management ({stats.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          🏪 Store Registry ({stats.totalStores || 0})
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`btn ${activeTab === 'ratings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          ⭐ Recent Ratings Feed ({stats.totalRatings || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          <Card>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>👥 Role Distribution Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>🛡️ System Administrators</span>
                  <span style={{ fontWeight: 700 }}>{roleBreakdown.adminCount || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#a855f7', width: `${((roleBreakdown.adminCount || 0) / (stats.totalUsers || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>🏪 Store Owners</span>
                  <span style={{ fontWeight: 700 }}>{roleBreakdown.ownerCount || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#10b981', width: `${((roleBreakdown.ownerCount || 0) / (stats.totalUsers || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>⭐ Normal Users (Consumers)</span>
                  <span style={{ fontWeight: 700 }}>{roleBreakdown.userCount || 0}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#6366f1', width: `${((roleBreakdown.userCount || 0) / (stats.totalUsers || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>🚀 Quick Administrative Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('users')}
                className="btn btn-secondary"
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                👥 <strong>Manage Users</strong> — View all accounts, filter by role
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className="btn btn-secondary"
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                🏪 <strong>Manage Stores</strong> — View store registry & owner bindings
              </button>
              <button
                onClick={() => onNavigate('stores')}
                className="btn btn-secondary"
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                🌐 <strong>Public Directory Preview</strong> — Browse customer view
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && <UserManagementPage />}

      {/* TAB 3: STORE MANAGEMENT */}
      {activeTab === 'stores' && <StoreManagementPage />}

      {/* TAB 4: RATINGS */}
      {activeTab === 'ratings' && (
        <Card>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem' }}>Live Consumer Ratings Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentRatings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No ratings submitted yet.</p>
            ) : (
              recentRatings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{r.user_name || `User #${r.user_id}`}</strong>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>reviewed</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{r.store_name || `Store #${r.store_id}`}</strong>
                    </div>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem' }}>
                      {'★'.repeat(r.rating_value || r.rating || 5)}{'☆'.repeat(5 - (r.rating_value || r.rating || 5))}
                      <span style={{ marginLeft: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ({r.rating_value || r.rating}/5)
                      </span>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
