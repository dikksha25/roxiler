import React, { useState } from 'react';

export const RatingStars = ({
  rating = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 22,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
              color: isFilled ? 'var(--clay-warning)' : '#D6D0E0',
              filter: isFilled ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.35))' : 'none',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: interactive && hoverRating >= starValue ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
