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
      setSuccess('Password changed successfully! Please use your new password next time you log in.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2500);
    } else {
      setError(res.message || 'Failed to change password. Please check your current password.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>🔒 Change Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Update your account credentials securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ✕
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
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.78rem',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
              PASSWORD REQUIREMENTS:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
              <span style={{ color: isLenValid ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                {isLenValid ? '✓' : '○'} 8 to 16 characters
              </span>
              <span style={{ color: isUpperValid ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                {isUpperValid ? '✓' : '○'} 1 uppercase letter
              </span>
              <span style={{ color: isSpecialValid ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                {isSpecialValid ? '✓' : '○'} 1 special character
              </span>
              <span style={{ color: isMatchValid ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                {isMatchValid ? '✓' : '○'} Passwords match
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
