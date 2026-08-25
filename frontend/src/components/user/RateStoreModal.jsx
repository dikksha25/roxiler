import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { StarRatingInput } from '../common/StarRatingInput';
import { ratingService } from '../../services/ratingService';

export const RateStoreModal = ({ isOpen, onClose, store, onRatingSubmitted }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isModify = store && store.user_rating !== null && store.user_rating !== undefined;

  useEffect(() => {
    if (isOpen && store) {
      setRatingValue(store.user_rating ? Number(store.user_rating) : 5);
      setComment(store.my_comment || '');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, store]);

  if (!store) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const score = parseInt(ratingValue, 10);
    if (isNaN(score) || score < 1 || score > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isModify) {
        res = await ratingService.modifyRating(store.id, {
          rating: score,
          comment,
        });
      } else {
        res = await ratingService.submitRating({
          storeId: store.id,
          rating: score,
          comment,
        });
      }

      setLoading(false);

      if (res && res.success) {
        onRatingSubmitted({
          storeId: store.id,
          ratingValue: score,
          comment,
          isModify,
        });
        onClose();
      }
    } catch (err) {
      setLoading(false);
      const serverMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to save rating. Please try again.';
      setError(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isModify ? `✏️ Modify Rating: ${store.name}` : `⭐ Rate: ${store.name}`}
      maxWidth="540px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        {/* State Banner */}
        <div
          style={{
            background: isModify ? 'rgba(124, 58, 237, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `2px solid ${isModify ? 'rgba(124, 58, 237, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
            borderRadius: 'var(--radius-clay-inner)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            fontSize: '0.92rem',
            color: 'var(--clay-text-primary)',
          }}
        >
          {isModify ? (
            <div>
              <strong style={{ color: 'var(--clay-accent-primary)' }}>Your Existing Rating:</strong> {store.user_rating} / 5 Stars.
              <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--clay-text-muted)', marginTop: '0.25rem' }}>
                Select a new score below to update your rating for this store.
              </span>
            </div>
          ) : (
            <div>
              <strong style={{ color: 'var(--clay-warning)' }}>New Verified Rating:</strong>
              <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--clay-text-muted)', marginTop: '0.25rem' }}>
                Select 1 to 5 stars to publish your customer score for this store.
              </span>
            </div>
          )}
        </div>

        {/* Interactive Star Component */}
        <StarRatingInput
          value={ratingValue}
          onChange={(newVal) => setRatingValue(newVal)}
          disabled={loading}
        />

        {/* Optional Review Comment */}
        <div className="clay-form-group" style={{ margin: '1.5rem 0' }}>
          <label
            htmlFor="rate-comment-input"
            className="clay-label"
          >
            Review Feedback (Optional)
          </label>
          <textarea
            id="rate-comment-input"
            className="clay-textarea"
            placeholder="Describe your customer experience, food quality, staff friendliness..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--clay-text-dim)', marginTop: '0.35rem', fontWeight: 600 }}>
            {comment.length} / 500 characters
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            borderTop: '2px solid rgba(124, 58, 237, 0.08)',
            paddingTop: '1.25rem',
          }}
        >
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {isModify ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
