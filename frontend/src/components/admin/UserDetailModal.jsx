import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ROLE_LABELS } from '../../constants/roles';

export const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 User Account Details" maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>User ID #{user.id}</span>
            <Badge role={user.role} />
          </div>

          <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
            {user.name}
          </h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '1rem' }}>
            {user.email}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Physical Address
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{user.address || 'No address provided'}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Role Description
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {ROLE_LABELS[user.role]} — {user.role === 'SYSTEM_ADMIN' ? 'Platform Governance' : user.role === 'STORE_OWNER' ? 'Store & Rating Management' : 'Consumer Reviews & Ratings'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Password Security
              </span>
              <span style={{ color: 'var(--accent-success)' }}>
                🔒 Salted Bcrypt Hash (Hidden & Protected)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Registered Date</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Last Profile Update</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
