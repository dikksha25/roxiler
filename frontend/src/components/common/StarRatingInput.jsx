import React, { useState } from 'react';

const STAR_LABELS = {
  1: '1 Star — Poor Experience',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Very Good',
  5: '5 Stars — Outstanding & Highly Recommended',
};

export const StarRatingInput = ({
  value = 5,
  onChange,
  disabled = false,
  size = '2.25rem',
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const activeScore = hoverValue || value || 5;

  const handleKeyDown = (e, star) => {
    if (disabled) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextStar = Math.min(5, (value || 0) + 1);
      onChange(nextStar);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prevStar = Math.max(1, (value || 0) - 1);
      onChange(prevStar);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(5);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(star);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <div
        role="radiogroup"
        aria-label="Store Star Rating Selection"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeScore;
          const isSelected = value === star;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${star} Star${star > 1 ? 's' : ''}`}
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onMouseLeave={() => !disabled && setHoverValue(0)}
              onClick={() => !disabled && onChange(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isFilled
                  ? 'var(--clay-gradient-amber)'
                  : '#EFEBF5',
                color: isFilled ? '#FFFFFF' : '#B8B2C4',
                boxShadow: isFilled
                  ? '8px 8px 16px rgba(245, 158, 11, 0.35), -6px -6px 12px rgba(255, 255, 255, 0.9), inset 3px 3px 6px rgba(255, 255, 255, 0.6), inset -3px -3px 6px rgba(0, 0, 0, 0.1)'
                  : 'var(--shadow-clay-pressed)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.2s ease',
                transform: isFilled ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                opacity: disabled ? 0.6 : 1,
                outline: 'none',
                border: isSelected ? '2px solid #F59E0B' : '2px solid transparent',
              }}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--clay-warning)',
          minHeight: '1.5rem',
        }}
      >
        {STAR_LABELS[activeScore]}
      </div>
    </div>
  );
};
