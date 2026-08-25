import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`clay-form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="clay-label">
          {label} {required && <span style={{ color: 'var(--clay-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="clay-input"
        style={error ? { borderColor: 'var(--clay-danger)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' } : {}}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.85rem', color: 'var(--clay-danger)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.82rem', color: 'var(--clay-text-dim)', fontWeight: 500 }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
