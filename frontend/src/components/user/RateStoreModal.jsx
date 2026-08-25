import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { ratingService } from '../../services/ratingService';

const STAR_LABELS = {
  1: '1 Star — Poor Experience',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Very Good',
  5: '5 Stars — Outstanding & Highly Recommended',
};

export const RateStoreModal = ({ isOpen, onClose, store, onRatingSubmitted }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isModify = store && store.user_rating !== null && store.user_rating !== undefined;

  useEffect(() => {
    if (isOpen && store) {
      setRatingValue(store.user_rating ? Number(store.user_rating) : 5);
      setComment(store.my_comment || '');
      setError(null);
    }
  }, [isOpen, store]);

  if (!store) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setLoading(true);
    try {
      const res = await ratingService.submitRating({
        storeId: store.id,
        ratingValue,
        comment,
      });

      setLoading(false);
      if (res && res.success) {
        onRatingSubmitted({
          storeId: store.id,
          ratingValue,
          comment,
        });
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    }
  };

  const activeScore = hoverRating || ratingValue;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isModify ? `✏️ Modify Rating for ${store.name}` : `⭐ Rate ${store.name}`}
      maxWidth="480px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
            Click to select your rating (1 to 5 Stars):
          </span>

          {/* Interactive Star Picker */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRatingValue(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2.25rem',
                  cursor: 'pointer',
                  color: star <= activeScore ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'transform 0.15s ease, color 0.15s ease',
                  transform: star <= activeScore ? 'scale(1.15)' : 'scale(1)',
                  padding: '0.2rem',
                }}
              >
                ★
              </button>
            ))}
          </div>

          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fbbf24',
              minHeight: '1.5rem',
            }}
          >
            {STAR_LABELS[activeScore]}
          </div>
        </div>

        {/* Optional Commentary */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Your Feedback & Review (Optional)
          </label>
          <textarea
            className="input-field"
            placeholder="Share your experience with this store (e.g. quality of items, customer service, atmosphere)..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {isModify ? 'Update My Rating' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
