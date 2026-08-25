import React from 'react';
import { Card } from './Card';

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, idx) => (
        <Card
          key={`skeleton-card-${idx}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            minHeight: '380px',
            position: 'relative',
          }}
        >
          {/* Cover Banner Skeleton */}
          <div
            className="clay-shimmer"
            style={{
              height: '90px',
              borderRadius: '20px',
              marginBottom: '1rem',
              width: '100%',
            }}
          />

          <div>
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="clay-shimmer" style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
              <div className="clay-shimmer" style={{ height: '24px', width: '60%', borderRadius: '12px' }} />
            </div>

            {/* Address */}
            <div className="clay-shimmer" style={{ height: '16px', width: '80%', borderRadius: '8px', marginBottom: '1.25rem' }} />

            {/* Rating Box Skeleton */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-clay-inner)',
                padding: '1rem 1.15rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div className="clay-shimmer" style={{ height: '14px', width: '35%', borderRadius: '6px' }} />
                <div className="clay-shimmer" style={{ height: '18px', width: '25%', borderRadius: '6px' }} />
              </div>
              <div className="clay-shimmer" style={{ height: '14px', width: '50%', borderRadius: '6px' }} />
            </div>

            {/* Status Pill Skeleton */}
            <div className="clay-shimmer" style={{ height: '32px', width: '100%', borderRadius: '9999px', marginBottom: '1.25rem' }} />
          </div>

          {/* Button Skeleton */}
          <div className="clay-shimmer" style={{ height: '48px', width: '100%', borderRadius: 'var(--radius-clay-button)' }} />
        </Card>
      ))}
    </>
  );
};
