import React from 'react';

export const Spinner = ({ size = 24, color = 'var(--accent-primary)', style = {} }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          animation: 'spin 0.8s linear infinite',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
