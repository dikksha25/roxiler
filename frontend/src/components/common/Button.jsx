import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon = null,
  ...props
}) => {
  let btnClass = 'clay-btn';
  
  if (variant === 'primary') btnClass += ' clay-btn-primary';
  else if (variant === 'secondary') btnClass += ' clay-btn-secondary';
  else if (variant === 'danger') btnClass += ' clay-btn-danger';
  else if (variant === 'ghost') btnClass += ' clay-btn-ghost';
  else btnClass += ` clay-btn-${variant}`;

  if (size === 'sm') btnClass += ' clay-btn-sm';
  else if (size === 'lg') btnClass += ' clay-btn-lg';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${btnClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'clay-spin 0.8s linear infinite' }}>⏳</span>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
