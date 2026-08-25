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
    <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
      <div
        role="radiogroup"
        aria-label="Store Star Rating Selection"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
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
                background: 'none',
                border: 'none',
                fontSize: size,
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: isFilled ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                transition: 'transform 0.15s ease, color 0.15s ease',
                transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                padding: '0.15rem',
                opacity: disabled ? 0.6 : 1,
                outline: 'none',
                borderRadius: '4px',
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
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#fbbf24',
          minHeight: '1.4rem',
        }}
      >
        {STAR_LABELS[activeScore]}
      </div>
    </div>
  );
};

