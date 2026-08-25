import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
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
      // Direct user to role dashboard
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
    <div className="fade-in" style={{ maxWidth: '480px', margin: '2rem auto' }}>
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Sign In</h2>
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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            variant="primary"
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            Sign In &rarr;
          </Button>
        </form>

        {/* Quick Demo Pre-fill Helpers */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
            Quick Role Demo Autofill
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDemoRole(ROLES.SYSTEM_ADMIN)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              🛡️ {ROLE_LABELS[ROLES.SYSTEM_ADMIN]}
            </button>
            <button
              type="button"
              onClick={() => setDemoRole(ROLES.STORE_OWNER)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              🏪 {ROLE_LABELS[ROLES.STORE_OWNER]}
            </button>
            <button
              type="button"
              onClick={() => setDemoRole(ROLES.NORMAL_USER)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              ⭐ {ROLE_LABELS[ROLES.NORMAL_USER]}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Register here
          </span>
        </div>
      </Card>
    </div>
  );
};
