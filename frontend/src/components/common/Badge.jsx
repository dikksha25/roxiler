import React from 'react';

export const Badge = ({ children, role, variant, className = '' }) => {
  let badgeClass = 'clay-badge';
  let label = children;

  if (role) {
    switch (role) {
      case 'SYSTEM_ADMIN':
        badgeClass += ' clay-badge-purple';
        label = label || 'Administrator';
        break;
      case 'STORE_OWNER':
        badgeClass += ' clay-badge-pink';
        label = label || 'Store Owner';
        break;
      case 'NORMAL_USER':
        badgeClass += ' clay-badge-green';
        label = label || 'Normal User';
        break;
      default:
        badgeClass += ' clay-badge-blue';
    }
  } else if (variant) {
    badgeClass += ` clay-badge-${variant}`;
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {label}
    </span>
  );
};
