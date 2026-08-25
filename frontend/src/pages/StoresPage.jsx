import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserStoreBrowsePage } from '../components/user/UserStoreBrowsePage';
import { Button } from '../components/common/Button';

export const StoresPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  // If authenticated (NORMAL_USER, STORE_OWNER, SYSTEM_ADMIN), render full store browsing & rating interface
  if (isAuthenticated) {
    return <UserStoreBrowsePage />;
  }

  // Guest view with sign-in prompt
  return (
    <div className="fade-in">
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, letterSpacing: '-0.02em' }}>
            🏪 Commercial Stores Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
            Sign in to rate stores, submit reviews, and manage your ratings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => onNavigate('login')}>
            Sign In to Rate
          </Button>
          <Button variant="primary" onClick={() => onNavigate('register')}>
            Register as User
          </Button>
        </div>
      </div>

      <UserStoreBrowsePage />
    </div>
  );
};
