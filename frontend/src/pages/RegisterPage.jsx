import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: ROLES.NORMAL_USER,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend validations
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and numbers.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join the StoreRate platform and choose your role
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
          <Input
            label="Full Name"
            id="register-name"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            id="register-email"
            type="email"
            name="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            id="register-password"
            type="password"
            name="password"
            placeholder="Min. 8 characters (A-Z, a-z, 0-9)"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Address"
            id="register-address"
            name="address"
            placeholder="e.g. 742 Evergreen Terrace, Springfield"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="register-role">
              Account Role
            </label>
            <select
              id="register-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value={ROLES.NORMAL_USER}>Normal User (Rate stores & browse)</option>
              <option value={ROLES.STORE_OWNER}>Store Owner (Manage store & view ratings)</option>
              <option value={ROLES.SYSTEM_ADMIN}>System Admin (Platform governance)</option>
            </select>
          </div>

          <Button
            variant="primary"
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            Complete Registration
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In
          </span>
        </div>
      </Card>
    </div>
  );
};
