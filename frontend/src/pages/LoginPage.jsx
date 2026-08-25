import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // Quick Demo Presets matching realistic seeded accounts
  const setDemoRole = (role) => {
    if (role === ROLES.SYSTEM_ADMIN) {
      setEmail('admin@storerating.com');
      setPassword('AdminPassword123!');
    } else if (role === ROLES.STORE_OWNER) {
      setEmail('owner.marcus@freshmart.com');
      setPassword('OwnerPassword123!');
    } else {
      setEmail('sarah.jenkins@example.com');
      setPassword('UserPassword123!');
    }
    setError('');
  };

  return (
    <div className="clay-page">
      <div className="clay-container" style={{ maxWidth: '520px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1.25rem', width: '60px', height: '60px', fontSize: '1.6rem' }}>
              🔑
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.35rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--clay-text-muted)', fontSize: '0.95rem' }}>
              Sign in to manage ratings, stores, and analytics
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="login-email"
              type="email"
              placeholder="admin@storerating.com or your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem', minHeight: '56px' }}
            >
              Sign In &rarr;
            </Button>
          </form>

          {/* Quick Demo Pre-fill Helpers */}
          <div
            style={{
              marginTop: '2rem',
              borderTop: '2px solid rgba(124, 58, 237, 0.08)',
              paddingTop: '1.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--clay-text-dim)',
                textTransform: 'uppercase',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '0.85rem',
                textAlign: 'center',
              }}
            >
              QUICK ROLE DEMO AUTOFILL
            </span>
            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setDemoRole(ROLES.SYSTEM_ADMIN)}
                className="clay-btn clay-btn-secondary clay-btn-sm"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoRole(ROLES.STORE_OWNER)}
                className="clay-btn clay-btn-secondary clay-btn-sm"
              >
                🏪 Store Owner
              </button>
              <button
                type="button"
                onClick={() => setDemoRole(ROLES.NORMAL_USER)}
                className="clay-btn clay-btn-secondary clay-btn-sm"
              >
                ⭐ Normal User
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.95rem', color: 'var(--clay-text-muted)' }}>
            Don't have an account yet?{' '}
            <span
              onClick={() => onNavigate('register')}
              style={{ color: 'var(--clay-accent-primary)', cursor: 'pointer', fontWeight: 800, fontFamily: 'var(--font-heading)' }}
            >
              Register here
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
