import React from 'react';

export const Badge = ({ children, variant = 'user', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
