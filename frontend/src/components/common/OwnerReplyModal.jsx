import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Alert } from './Alert';
import { ratingService } from '../../services/ratingService';

export const OwnerReplyModal = ({ isOpen, onClose, rating, onReplySaved }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && rating) {
      setReplyText(rating.owner_reply || '');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, rating]);

  if (!rating) return null;

  const isExistingReply = !!rating.owner_reply;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError('Please write a reply message before submitting.');
      return;
    }
    if (replyText.trim().length > 500) {
      setError('Reply cannot exceed 500 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ratingService.replyToRating(rating.id, replyText.trim());
      setLoading(false);
      if (res && res.success) {
        if (onReplySaved) {
          onReplySaved({
            ratingId: rating.id,
            ownerReply: replyText.trim(),
            ownerRepliedAt: new Date().toISOString(),
          });
        }
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to post reply. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isExistingReply ? '✏️ Edit Merchant Response' : '💬 Reply to Customer Review'}
      maxWidth="560px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Customer Review Summary Card */}
      <div
        style={{
          background: 'var(--clay-input-bg)',
          boxShadow: 'var(--shadow-clay-pressed)',
          borderRadius: 'var(--radius-clay-inner)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--clay-text-primary)', fontSize: '0.95rem' }}>
            👤 {rating.user?.name || rating.user_name || 'Verified Customer'}
          </span>
          <span
            className={`clay-badge ${
              rating.rating_value >= 4
                ? 'clay-badge-green'
                : rating.rating_value === 3
                ? 'clay-badge-amber'
                : 'clay-badge-pink'
            }`}
          >
            ⭐ {rating.rating_value || rating.rating} / 5 Stars
          </span>
        </div>

        {rating.comment ? (
          <p style={{ margin: 0, color: 'var(--clay-text-muted)', fontSize: '0.92rem', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{rating.comment}"
          </p>
        ) : (
          <span style={{ color: 'var(--clay-text-dim)', fontSize: '0.85rem' }}>
            (Customer submitted a rating without written feedback)
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="clay-form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="owner-reply-input" className="clay-label">
            Official Store Response <span style={{ color: 'var(--clay-danger)' }}>*</span>
          </label>
          <textarea
            id="owner-reply-input"
            className="clay-textarea"
            placeholder="Thank the customer, address feedback, or highlight upcoming improvements..."
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={loading}
            maxLength={500}
            required
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--clay-text-dim)' }}>
              Visible publicly under this review in the store catalog
            </span>
            <span style={{ color: replyText.length > 450 ? 'var(--clay-warning)' : 'var(--clay-text-dim)' }}>
              {replyText.length} / 500
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)', paddingTop: '1.25rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} disabled={!replyText.trim() || loading}>
            {isExistingReply ? 'Save Changes' : 'Post Official Reply'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnerReplyModal;
