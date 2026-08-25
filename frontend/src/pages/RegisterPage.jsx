import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
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
    <div className="clay-page">
      <div className="clay-container" style={{ maxWidth: '560px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="clay-orb clay-orb-pink" style={{ margin: '0 auto 1.25rem', width: '60px', height: '60px', fontSize: '1.6rem' }}>
              📝
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.35rem' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem' }}>
              Register as a <strong>Normal User</strong> to rate and review local stores
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="clay-label" htmlFor="register-name">
                  Full Name <span style={{ color: 'var(--clay-danger)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isNameLenValid ? 'var(--clay-success)' : 'var(--clay-text-dim)' }}>
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
                  background: '#EFEBF5',
                  boxShadow: 'var(--shadow-clay-pressed)',
                  borderRadius: 'var(--radius-clay-inner)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: isLenValid ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
                  {isLenValid ? '✓' : '○'} 8–16 characters
                </span>
                <span style={{ color: hasUppercase ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
                  {hasUppercase ? '✓' : '○'} 1 Uppercase letter
                </span>
                <span style={{ color: hasSpecial ? 'var(--clay-success)' : 'var(--clay-text-dim)', fontWeight: 700 }}>
                  {hasSpecial ? '✓' : '○'} 1 Special character
                </span>
                <span style={{ color: 'var(--clay-accent-primary)', fontWeight: 800 }}>
                  🔒 Role: Normal User
                </span>
              </div>
            </div>

            <div className="clay-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="clay-label" htmlFor="register-address">
                  Physical Address (Optional)
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: formData.address.length > 400 ? 'var(--clay-danger)' : 'var(--clay-text-dim)' }}>
                  {formData.address.length}/400 chars
                </span>
              </div>
              <textarea
                id="register-address"
                className="clay-textarea"
                placeholder="Enter your street address, city, postal code (max 400 chars)"
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                style={{ resize: 'vertical' }}
              />
              {fieldErrors.address && (
                <span style={{ color: 'var(--clay-danger)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  {fieldErrors.address}
                </span>
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              style={{ width: '100%', minHeight: '56px', marginTop: '0.5rem' }}
            >
              Create Account &rarr;
            </Button>
          </form>

          {/* Demo Auto-fill Helper */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '2px solid rgba(124, 58, 237, 0.08)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={autofillSampleUser}
              className="clay-btn clay-btn-secondary clay-btn-sm"
            >
              ✨ Autofill Valid Sample User
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--clay-text-muted)' }}>
            Already have an account?{' '}
            <span
              onClick={() => onNavigate('login')}
              style={{ color: 'var(--clay-accent-primary)', cursor: 'pointer', fontWeight: 800, fontFamily: 'var(--font-heading)' }}
            >
              Sign in here
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
