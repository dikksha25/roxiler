import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 36 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', gap: '1rem' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '3px solid rgba(124, 58, 237, 0.15)',
          borderTopColor: 'var(--clay-accent-primary)',
          animation: 'clay-spin 0.8s linear infinite',
        }}
      />
      {text && <span style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>{text}</span>}
    </div>
  );
};
