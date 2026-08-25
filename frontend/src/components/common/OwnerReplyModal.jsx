import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Alert } from './Alert';
import { ratingService } from '../../services/ratingService';

export const OwnerReplyModal = ({ isOpen, onClose, rating, onReplySubmitted }) => {
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

  const isEdit = !!rating.owner_reply;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!replyText.trim()) {
      setError('Please enter a reply message before submitting.');
      return;
    }

    if (replyText.trim().length > 500) {
      setError('Reply message cannot exceed 500 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ratingService.replyToRating(rating.id, {
        reply: replyText.trim(),
      });

      setLoading(false);
      if (res && res.success) {
        onReplySubmitted({
          ratingId: rating.id,
          ownerReply: replyText.trim(),
          ownerRepliedAt: new Date().toISOString(),
        });
        onClose();
      }
    } catch (err) {
      setLoading(false);
      const serverMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to publish reply. Please try again.';
      setError(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `💬 Edit Merchant Reply` : `💬 Reply to Customer Review`}
      maxWidth="560px"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Customer Review Summary Card */}
      <div
        style={{
          background: '#EFEBF5',
          boxShadow: 'var(--shadow-clay-pressed)',
          borderRadius: 'var(--radius-clay-inner)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <strong style={{ color: 'var(--clay-text-primary)', fontSize: '1rem' }}>
            {rating.user?.name || rating.user_name || 'Customer User'}
          </strong>
          <span className="clay-badge clay-badge-amber" style={{ fontSize: '0.85rem' }}>
            ⭐ {rating.rating_value || rating.rating} / 5 Stars
          </span>
        </div>
        <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.92rem', margin: 0, fontStyle: 'italic' }}>
          "{rating.comment || 'Customer submitted score without written review.'}"
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="clay-form-group" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="clay-label" htmlFor="owner-reply-text">
              Official Merchant Response <span style={{ color: 'var(--clay-danger)' }}>*</span>
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: replyText.length > 500 ? 'var(--clay-danger)' : 'var(--clay-text-dim)' }}>
              {replyText.length}/500 chars
            </span>
          </div>
          <textarea
            id="owner-reply-text"
            className="clay-textarea"
            placeholder="Thank the customer for visiting, address their feedback, or offer help..."
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={loading}
            maxLength={500}
            required
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--clay-text-dim)', marginTop: '0.4rem', display: 'block', fontWeight: 600 }}>
            💡 Your reply will be publicly visible to all customers on the store directory.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '2px solid rgba(124, 58, 237, 0.08)', paddingTop: '1.25rem' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {isEdit ? 'Update Reply' : 'Publish Response'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
