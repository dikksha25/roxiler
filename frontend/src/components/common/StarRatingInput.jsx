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

  return (
    <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeScore;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onMouseLeave={() => !disabled && setHoverValue(0)}
              onClick={() => !disabled && onChange(star)}
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
              }}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          );
        })}
      </div>

      <div
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
