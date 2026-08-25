import React from 'react';
import { Card } from './Card';

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={`skeleton-card-${idx}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Simulated Category Top Banner Shimmer */}
          <div
            className="clay-skeleton"
            style={{
              height: '52px',
              borderRadius: '20px',
              marginBottom: '1.25rem',
              width: '100%',
            }}
          />

          <div>
            {/* Title & Icon Shimmer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                className="clay-skeleton"
                style={{ width: '44px', height: '44px', borderRadius: '50%' }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="clay-skeleton"
                  style={{ height: '22px', width: '70%', borderRadius: '10px', marginBottom: '0.4rem' }}
                />
                <div
                  className="clay-skeleton"
                  style={{ height: '14px', width: '45%', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Address Line Shimmer */}
            <div
              className="clay-skeleton"
              style={{ height: '16px', width: '85%', borderRadius: '8px', marginBottom: '1.25rem' }}
            />

            {/* Score Box Shimmer */}
            <div
              className="clay-skeleton"
              style={{
                height: '76px',
                borderRadius: 'var(--radius-clay-inner)',
                marginBottom: '1.25rem',
              }}
            />

            {/* Status Badge Shimmer */}
            <div
              className="clay-skeleton"
              style={{ height: '32px', borderRadius: '9999px', marginBottom: '1.25rem', width: '60%' }}
            />
          </div>

          {/* Bottom Button Shimmer */}
          <div
            className="clay-skeleton"
            style={{ height: '48px', borderRadius: 'var(--radius-clay-btn)', width: '100%' }}
          />
        </Card>
      ))}
    </>
  );
};

export default SkeletonCard;
