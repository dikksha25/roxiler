import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ROLE_LABELS } from '../constants/roles';

export const UnauthorizedPage = ({ userRole, allowedRoles = [], onNavigate }) => {
  return (
    <div className="fade-in" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <Card style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            fontSize: '1.75rem',
          }}
        >
          🚫
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#f87171' }}>
          403 Access Denied
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          You do not have administrative or role-level permissions to view this resource.
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Your Current Role:</span>
            <Badge role={userRole} />
          </div>
          {allowedRoles.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Required Role:</span>
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                {allowedRoles.map((r) => ROLE_LABELS[r] || r).join(' / ')}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Button variant="primary" onClick={() => onNavigate && onNavigate('dashboard')}>
            &larr; Return to My Dashboard
          </Button>
          <Button variant="secondary" onClick={() => onNavigate && onNavigate('stores')}>
            Browse Stores
          </Button>
        </div>
      </Card>
    </div>
  );
};
