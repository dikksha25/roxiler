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
    if (loading) return; // Prevent duplicate clicks

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
        // State B: Modify Existing Rating (PUT /api/v1/ratings/:storeId)
        res = await ratingService.modifyRating(store.id, {
          rating: score,
          comment,
        });
      } else {
        // State A: Submit New Rating (POST /api/v1/ratings)
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
      maxWidth="500px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        {/* State Banner */}
        <div
          style={{
            background: isModify ? 'rgba(99, 102, 241, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isModify ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          {isModify ? (
            <div>
              <strong>Current Submitted Rating:</strong> {store.user_rating} / 5 Stars.
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Select a new score below to update your rating for this store.
              </span>
            </div>
          ) : (
            <div>
              <strong>New Store Review:</strong>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                You haven't rated this store yet. Share your 1 to 5 star rating with the community.
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
        <div style={{ margin: '1.25rem 0' }}>
          <label
            htmlFor="rate-comment-input"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Review & Experience Feedback (Optional)
          </label>
          <textarea
            id="rate-comment-input"
            className="input-field"
            placeholder="Describe your customer experience, food or product quality, staff friendliness, cleanliness..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            style={{ width: '100%', resize: 'vertical' }}
            maxLength={500}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {comment.length} / 500 characters
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
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
            {isModify ? 'Update My Rating' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
