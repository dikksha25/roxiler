import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { userService } from '../../services/userService';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const UserDetailModal = ({ isOpen, onClose, user }) => {
  const [enrichedUser, setEnrichedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && user.id) {
      const fetchEnriched = async () => {
        setLoading(true);
        try {
          const res = await userService.getUserById(user.id);
          if (res && res.data) {
            setEnrichedUser(res.data);
          } else {
            setEnrichedUser(user);
          }
        } catch {
          setEnrichedUser(user);
        } finally {
          setLoading(false);
        }
      };

      fetchEnriched();
    } else {
      setEnrichedUser(null);
    }
  }, [isOpen, user]);

  if (!user) return null;

  const displayUser = enrichedUser || user;
  const isOwner = displayUser.role === ROLES.STORE_OWNER;
  const isNormalUser = displayUser.role === ROLES.NORMAL_USER;
  const isAdmin = displayUser.role === ROLES.SYSTEM_ADMIN;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 User Account Profile" maxWidth="580px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Spinner size={40} />
            <p style={{ marginTop: '1rem', color: 'var(--clay-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              Loading enriched account details...
            </p>
          </div>
        ) : (
          <>
            {/* Primary Profile Card */}
            <div
              style={{
                background: '#EFEBF5',
                boxShadow: 'var(--shadow-clay-pressed)',
                borderRadius: 'var(--radius-clay-inner)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-dim)', fontWeight: 700 }}>User ID #{displayUser.id}</span>
                <Badge role={displayUser.role} />
              </div>

              <h3 style={{ fontSize: '1.45rem', margin: '0 0 0.25rem 0', fontWeight: 900, color: 'var(--clay-text-primary)' }}>
                {displayUser.name}
              </h3>
              <span style={{ fontSize: '0.95rem', color: 'var(--clay-accent-primary)', display: 'block', marginBottom: '1.25rem', fontWeight: 600 }}>
                {displayUser.email}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    Physical Address
                  </span>
                  <span style={{ color: 'var(--clay-text-primary)' }}>
                    {displayUser.address || 'No physical address provided'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    Role Clearance
                  </span>
                  <span style={{ color: 'var(--clay-text-primary)' }}>
                    {ROLE_LABELS[displayUser.role]}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    Password Security
                  </span>
                  <span style={{ color: 'var(--clay-success)', fontWeight: 700 }}>
                    🔒 Salted Bcrypt Hash (Hidden &amp; Never Exposed)
                  </span>
                </div>
              </div>
            </div>

            {/* Role-Specific Section 1: STORE_OWNER */}
            {isOwner && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-clay-inner)',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--clay-success)', fontWeight: 800 }}>
                    🏪 Owned Stores &amp; Rating Performance
                  </h4>
                  <span className="clay-badge clay-badge-green">
                    {displayUser.owned_stores ? displayUser.owned_stores.length : 0} Associated Stores
                  </span>
                </div>

                {!displayUser.owned_stores || displayUser.owned_stores.length === 0 ? (
                  <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    No stores currently assigned to this owner account. Stores can be assigned in the Store Registry.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {displayUser.owned_stores.map((st) => {
                      const rating = parseFloat(st.overall_rating || st.average_rating || 0);
                      return (
                        <div
                          key={st.id}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow-clay-card)',
                            padding: '1rem 1.25rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <strong style={{ color: 'var(--clay-text-primary)', fontSize: '1.05rem' }}>
                              {st.name}
                            </strong>
                            <span className="clay-badge clay-badge-amber">
                              ★ {rating.toFixed(2)}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--clay-text-muted)', marginBottom: '0.35rem' }}>
                            📍 {st.address}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
                            <span>✉️ {st.email}</span>
                            <span>⭐ {st.rating_count || 0} reviews</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Role-Specific Section 2: NORMAL_USER */}
            {isNormalUser && (
              <div
                style={{
                  background: 'rgba(124, 58, 237, 0.06)',
                  border: '2px solid rgba(124, 58, 237, 0.15)',
                  borderRadius: 'var(--radius-clay-inner)',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--clay-accent-primary)', fontWeight: 800 }}>
                  ⭐ Consumer Reviewer Details
                </h4>
                <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  This account has permissions to browse the public commercial directory and submit 1-to-5 star ratings with feedback.
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--clay-text-primary)', fontWeight: 700 }}>
                  Submitted Reviews: <strong style={{ color: 'var(--clay-accent-primary)' }}>{displayUser.total_ratings_submitted || 0}</strong>
                </div>
              </div>
            )}

            {/* Role-Specific Section 3: SYSTEM_ADMIN */}
            {isAdmin && (
              <div
                style={{
                  background: 'rgba(219, 39, 119, 0.06)',
                  border: '2px solid rgba(219, 39, 119, 0.15)',
                  borderRadius: 'var(--radius-clay-inner)',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--clay-accent-secondary)', fontWeight: 800 }}>
                  🛡️ Administrator Clearance
                </h4>
                <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Super administrator profile with full authorization to create users, assign roles, register commercial stores, and monitor telemetry.
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>
              <div>
                Joined: {displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div style={{ textAlign: 'right' }}>
                Last Updated: {displayUser.updated_at ? new Date(displayUser.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid rgba(124, 58, 237, 0.08)', paddingTop: '1.25rem' }}>
          <Button variant="secondary" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};
