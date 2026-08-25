import React from 'react';

export const Alert = ({ type = 'info', message, onClose, style = {} }) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.35)',
      color: '#f87171',
      icon: '⚠️',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.35)',
      color: '#34d399',
      icon: '✅',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.35)',
      color: '#fbbf24',
      icon: '⚡',
    },
    info: {
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.35)',
      color: '#818cf8',
      icon: 'ℹ️',
    },
  };

  const current = typeStyles[type] || typeStyles.info;

  return (
    <div
      style={{
        background: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{current.icon}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 0.25rem',
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
