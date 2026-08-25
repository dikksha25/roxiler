import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { RatingStars } from '../components/common/RatingStars';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../constants/roles';
import { storeService } from '../services/storeService';

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [ownerStores, setOwnerStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === ROLES.STORE_OWNER) {
      const fetchOwnerStores = async () => {
        setLoading(true);
        try {
          const res = await storeService.getMyStores();
          if (res.data) setOwnerStores(res.data);
        } catch (err) {
          console.warn('Could not fetch owner stores:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOwnerStores();
    }
  }, [user]);

  return (
    <div className="fade-in">
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Welcome, {user?.name}</h1>
            <Badge variant={ROLE_BADGE_VARIANTS[user?.role] || 'user'}>
              {ROLE_LABELS[user?.role] || user?.role}
            </Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Logged in as <strong>{user?.email}</strong>
          </p>
        </div>

        <Button variant="secondary" onClick={() => onNavigate('stores')}>
          Browse All Stores
        </Button>
      </div>

      {/* Role-Specific View 1: SYSTEM_ADMIN */}
      {user?.role === ROLES.SYSTEM_ADMIN && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <Card style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Role Context</span>
              <h3 style={{ fontSize: '1.4rem', color: '#c7d2fe', marginTop: '0.25rem' }}>System Administrator</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Full administrative access to platform governance and store lifecycle.
              </p>
            </Card>

            <Card style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Management</span>
              <h3 style={{ fontSize: '1.4rem', color: '#e9d5ff', marginTop: '0.25rem' }}>User &amp; Store Directory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Manage registered user accounts and inspect store rating metrics.
              </p>
            </Card>

            <Card style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>API Ready</span>
              <h3 style={{ fontSize: '1.4rem', color: '#a7f3d0', marginTop: '0.25rem' }}>RBAC Protected</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Protected endpoints: <code style={{ color: '#6ee7b7' }}>/api/users</code> &amp; <code style={{ color: '#6ee7b7' }}>/api/users/stats</code>
              </p>
            </Card>
          </div>

          <Card>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Admin Control Center</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              The backend foundation includes role-protected controllers and endpoints ready for full platform administrative operations.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => onNavigate('stores')}>
                Manage Store Listings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Role-Specific View 2: STORE_OWNER */}
      {user?.role === ROLES.STORE_OWNER && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <Card style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Owned Stores</span>
              <h3 style={{ fontSize: '1.8rem', color: '#6ee7b7', marginTop: '0.25rem' }}>{ownerStores.length}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Stores registered under your account
              </p>
            </Card>

            <Card style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Ratings Access</span>
              <h3 style={{ fontSize: '1.4rem', color: '#c7d2fe', marginTop: '0.25rem' }}>Real-time Aggregation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Live average ratings computed in PostgreSQL
              </p>
            </Card>
          </div>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>My Store Portfolio</h3>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading store portfolio...</p>
            ) : ownerStores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  No stores assigned to your account yet. Explore all stores in the directory.
                </p>
                <Button variant="secondary" onClick={() => onNavigate('stores')}>
                  Browse Store Directory
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ownerStores.map((store) => (
                  <div
                    key={store.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{store.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{store.address}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <RatingStars rating={Math.round(store.average_rating || 0)} size={16} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                          Avg: {store.average_rating} ({store.rating_count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Role-Specific View 3: NORMAL_USER */}
      {user?.role === ROLES.NORMAL_USER && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <Card style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Account Profile</span>
              <h3 style={{ fontSize: '1.3rem', color: '#93c5fd', marginTop: '0.25rem' }}>Verified Reviewer</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Address: {user?.address || 'Not specified'}
              </p>
            </Card>

            <Card style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Permissions</span>
              <h3 style={{ fontSize: '1.3rem', color: '#c7d2fe', marginTop: '0.25rem' }}>Submit &amp; Edit Ratings</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Give 1–5 star ratings and feedback to local stores
              </p>
            </Card>
          </div>

          <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Ready to Rate Stores?</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Browse the store directory to view ratings, inspect community feedback, and submit your personal ratings.
            </p>
            <Button variant="primary" onClick={() => onNavigate('stores')}>
              Explore Stores Directory
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
