import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const StoreDetailModal = ({ isOpen, onClose, store }) => {
  if (!store) return null;

  const avg = parseFloat(store.overall_rating || store.average_rating || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏪 Commercial Store Details" maxWidth="500px">
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Store ID #{store.id}</span>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>★</span>
              <span>{avg.toFixed(2)} / 5.0</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0', color: 'var(--accent-primary)' }}>
            {store.name}
          </h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '1.25rem' }}>
            {store.email}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Physical Location
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{store.address}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Assigned Store Owner
              </span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                👤 {store.owner_name || `Owner ID #${store.owner_id || 'None'}`}
                {store.owner_email && ` (${store.owner_email})`}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Customer Ratings & Feedback
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                  {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ({store.rating_count || 0} reviews computed dynamically)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Registered Date</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {store.created_at ? new Date(store.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Directory Status</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                  ✓ Verified Commercial Store
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
