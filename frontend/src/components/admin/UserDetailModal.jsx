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
    <Modal isOpen={isOpen} onClose={onClose} title="👤 User Account Profile & Details" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner size={32} />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading enriched account details...
            </p>
          </div>
        ) : (
          <>
            {/* Primary Profile Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>User ID #{displayUser.id}</span>
                <Badge role={displayUser.role} />
              </div>

              <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                {displayUser.name}
              </h3>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '1rem' }}>
                {displayUser.email}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Physical Address
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {displayUser.address || 'No physical address provided'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Role Clearance
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {ROLE_LABELS[displayUser.role]}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Password Security
                  </span>
                  <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                    🔒 Salted Bcrypt Hash (Hidden & Never Exposed)
                  </span>
                </div>
              </div>
            </div>

            {/* Role-Specific Section 1: STORE_OWNER */}
            {isOwner && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent-success)' }}>
                    🏪 Owned Stores & Rating Performance
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {displayUser.owned_stores ? displayUser.owned_stores.length : 0} Associated Stores
                  </span>
                </div>

                {!displayUser.owned_stores || displayUser.owned_stores.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    No stores currently assigned to this owner account. Stores can be assigned in the Store Registry.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {displayUser.owned_stores.map((st) => {
                      const rating = parseFloat(st.overall_rating || st.average_rating || 0);
                      return (
                        <div
                          key={st.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.85rem 1rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {st.name}
                            </strong>
                            <div
                              style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              }}
                            >
                              ★ {rating.toFixed(2)}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            📍 {st.address}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            <span>✉️ {st.email}</span>
                            <span>⭐ {st.rating_count || 0} reviews received</span>
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
                  background: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                  ⭐ Consumer Reviewer Details
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  This account has permissions to browse the public commercial directory and submit 1-to-5 star ratings with feedback.
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Submitted Reviews: <strong>{displayUser.total_ratings_submitted || 0}</strong>
                </div>
              </div>
            )}

            {/* Role-Specific Section 3: SYSTEM_ADMIN */}
            {isAdmin && (
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#c084fc' }}>
                  🛡️ Administrator Governance Clearance
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Super administrator profile with full authorization to create users, assign roles, register commercial stores, and monitor telemetry.
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <div>
                Joined: {displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div style={{ textAlign: 'right' }}>
                Last Updated: {displayUser.updated_at ? new Date(displayUser.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <Button variant="secondary" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};
