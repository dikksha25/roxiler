import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Password validation indicators
  const isLenValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/.test(formData.password);
  const isNameLenValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side pre-validation
    const errors = {};
    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
    if (!isLenValid) {
      errors.password = 'Password must be between 8 and 16 characters';
    } else if (!hasUppercase) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!hasSpecial) {
      errors.password = 'Password must contain at least one special character';
    }
    if (formData.address && formData.address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      address: formData.address.trim(),
    });
    setLoading(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const mapped = {};
        result.errors.forEach((err) => {
          mapped[err.field] = err.message;
        });
        setFieldErrors(mapped);
        setError('Please fix the highlighted validation errors.');
      } else {
        setError(result.message || 'Registration failed. Please check your information.');
      }
    }
  };

  const autofillSampleUser = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: 'Christopher Robin Sterling',
      email: `user.${randomSuffix}@example.com`,
      password: 'SecurePassword123!',
      address: '742 Evergreen Terrace, Sector 4, Springfield',
    });
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="fade-in" style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Register as a <strong>Normal User</strong> to rate and review stores
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Full Name <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: isNameLenValid ? 'var(--accent-success)' : 'var(--text-dim)' }}>
                {formData.name.length}/60 chars (min 20)
              </span>
            </div>
            <Input
              id="register-name"
              type="text"
              placeholder="e.g. Christopher Robin Sterling"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={fieldErrors.name}
              required
            />
          </div>

          <Input
            label="Email Address"
            id="register-email"
            type="email"
            placeholder="e.g. chris.sterling@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
            required
          />

          <div>
            <Input
              label="Password"
              id="register-password"
              type="password"
              placeholder="8 to 16 characters"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password}
              required
            />

            {/* Live Password Criteria Indicators */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.4rem',
              }}
            >
              <span style={{ color: isLenValid ? 'var(--accent-success)' : 'var(--text-dim)' }}>
                {isLenValid ? '✓' : '○'} 8–16 characters
              </span>
              <span style={{ color: hasUppercase ? 'var(--accent-success)' : 'var(--text-dim)' }}>
                {hasUppercase ? '✓' : '○'} 1 Uppercase letter
              </span>
              <span style={{ color: hasSpecial ? 'var(--accent-success)' : 'var(--text-dim)' }}>
                {hasSpecial ? '✓' : '○'} 1 Special character
              </span>
              <span style={{ color: 'var(--accent-secondary)' }}>
                🔒 Role: Normal User
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Address (Optional)
              </label>
              <span style={{ fontSize: '0.75rem', color: formData.address.length > 400 ? 'var(--accent-danger)' : 'var(--text-dim)' }}>
                {formData.address.length}/400 chars
              </span>
            </div>
            <textarea
              id="register-address"
              className="input-field"
              placeholder="Enter your street address, city, postal code (max 400 chars)"
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              style={{ resize: 'vertical', width: '100%', marginBottom: '1.25rem' }}
            />
            {fieldErrors.address && (
              <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', display: 'block', marginTop: '-0.75rem', marginBottom: '1rem' }}>
                {fieldErrors.address}
              </span>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            loading={loading}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Create Account &rarr;
          </Button>
        </form>

        {/* Demo Auto-fill Helper */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={autofillSampleUser}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            ✨ Autofill Valid Sample User
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign in here
          </span>
        </div>
      </Card>
    </div>
  );
};
