import React from 'react';

export const Alert = ({ type = 'info', message, onClose, style = {} }) => {
  if (!message) return null;

  let alertClass = 'clay-alert';
  let icon = 'ℹ️';

  if (type === 'error' || type === 'danger') {
    alertClass += ' clay-alert-danger';
    icon = '⚠️';
  } else if (type === 'success') {
    alertClass += ' clay-alert-success';
    icon = '✅';
  } else if (type === 'warning') {
    alertClass += ' clay-alert-warning';
    icon = '⚡';
  } else {
    alertClass += ' clay-alert-info';
    icon = 'ℹ️';
  }

  return (
    <div className={alertClass} style={{ marginBottom: '1.25rem', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
        <span style={{ fontSize: '1.15rem' }}>{icon}</span>
        <span style={{ fontWeight: 600 }}>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: '0 0.25rem',
            opacity: 0.7,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
