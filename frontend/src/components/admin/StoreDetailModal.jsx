import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const StoreDetailModal = ({ isOpen, onClose, store }) => {
  if (!store) return null;

  const avg = parseFloat(store.overall_rating || store.average_rating || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏪 Commercial Store Profile" maxWidth="540px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            background: '#EFEBF5',
            boxShadow: 'var(--shadow-clay-pressed)',
            borderRadius: 'var(--radius-clay-inner)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-dim)', fontWeight: 700 }}>Store ID #{store.id}</span>
            <span className="clay-badge clay-badge-amber">
              ★ {avg.toFixed(2)} / 5.0
            </span>
          </div>

          <h3 style={{ fontSize: '1.45rem', margin: '0 0 0.25rem 0', color: 'var(--clay-text-primary)', fontWeight: 900 }}>
            {store.name}
          </h3>
          <span style={{ fontSize: '0.95rem', color: 'var(--clay-accent-primary)', display: 'block', marginBottom: '1.25rem', fontWeight: 600 }}>
            {store.email}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                Physical Location
              </span>
              <span style={{ color: 'var(--clay-text-primary)', fontWeight: 600 }}>{store.address}</span>
            </div>

            <div>
              <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                Assigned Store Owner
              </span>
              <span style={{ color: 'var(--clay-success)', fontWeight: 700 }}>
                👤 {store.owner_name || `Owner ID #${store.owner_id || 'None'}`}
                {store.owner_email && ` (${store.owner_email})`}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--clay-text-dim)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800 }}>
                Customer Ratings &amp; Feedback
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--clay-warning)', fontSize: '1.2rem' }}>
                  {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
                </span>
                <span style={{ color: 'var(--clay-text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
                  ({store.rating_count || 0} reviews computed dynamically)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)' }}>
              <div>
                <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>Registered Date</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--clay-text-primary)', fontWeight: 700 }}>
                  {store.created_at ? new Date(store.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>Directory Status</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--clay-success)', fontWeight: 700 }}>
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
