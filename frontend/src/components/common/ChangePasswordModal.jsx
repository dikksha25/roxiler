import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const { currentPassword, newPassword, confirmPassword } = formData;

  // Real-time validation checks
  const isLenValid = newPassword.length >= 8 && newPassword.length <= 16;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isSpecialValid = /[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/.test(newPassword);
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;
  const isDistinctValid = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;

  const allValid = isLenValid && isUpperValid && isSpecialValid && isMatchValid && isDistinctValid && currentPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLenValid) {
      setError('New password must be between 8 and 16 characters.');
      return;
    }
    if (!isUpperValid) {
      setError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!isSpecialValid) {
      setError('New password must contain at least one special character.');
      return;
    }
    if (!isMatchValid) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (!isDistinctValid) {
      setError('New password cannot be identical to your current password.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Password changed successfully! Please use your new credentials on your next login.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } else {
      setError(res.message || 'Failed to change password. Please check your current password.');
    }
  };

  return (
    <div
      className="clay-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="clay-modal-dialog" style={{ maxWidth: '520px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(124, 58, 237, 0.08)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.45rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>
              🔒 Change Password
            </h2>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Update your account credentials securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="clay-btn clay-btn-secondary clay-btn-sm"
            style={{
              width: '38px',
              height: '38px',
              minHeight: '38px',
              padding: 0,
              borderRadius: '50%',
              fontSize: '1.2rem',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Current Password"
            id="modal-current-password"
            type="password"
            placeholder="Enter your existing password"
            value={currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="New Password"
            id="modal-new-password"
            type="password"
            placeholder="8–16 chars, 1 uppercase & 1 special"
            value={newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="Confirm New Password"
            id="modal-confirm-password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />

          {/* Real-time requirements checklist */}
          <div
            style={{
              background: '#EFEBF5',
              borderRadius: 'var(--radius-clay-inner)',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-clay-pressed)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: '0.82rem',
                color: 'var(--clay-text-primary)',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '0.65rem',
              }}
            >
              PASSWORD CRITERIA:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: isLenValid ? 'var(--clay-success)' : 'var(--clay-text-muted)', fontWeight: 700 }}>
                {isLenValid ? '✓' : '○'} 8 to 16 characters
              </span>
              <span style={{ color: isUpperValid ? 'var(--clay-success)' : 'var(--clay-text-muted)', fontWeight: 700 }}>
                {isUpperValid ? '✓' : '○'} 1 uppercase letter
              </span>
              <span style={{ color: isSpecialValid ? 'var(--clay-success)' : 'var(--clay-text-muted)', fontWeight: 700 }}>
                {isSpecialValid ? '✓' : '○'} 1 special character
              </span>
              <span style={{ color: isMatchValid ? 'var(--clay-success)' : 'var(--clay-text-muted)', fontWeight: 700 }}>
                {isMatchValid ? '✓' : '○'} Passwords match
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} disabled={!allValid || loading}>
              Save New Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
