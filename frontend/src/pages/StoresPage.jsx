import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserStoreBrowsePage } from '../components/user/UserStoreBrowsePage';
import { ROLES } from '../constants/roles';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const StoresPage = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();

  // If logged in as NORMAL_USER, render the full personal store browsing experience
  if (isAuthenticated && user?.role === ROLES.NORMAL_USER) {
    return <UserStoreBrowsePage />;
  }

  // If not a normal user or not authenticated, render UserStoreBrowsePage or public directory preview
  if (isAuthenticated) {
    return (
      <div className="fade-in">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>🏪 Commercial Stores Directory Preview</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Logged in as <strong>{user.role}</strong> ({user.name}). To submit customer ratings, sign in with a Normal User account.
            </p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
            Back to Dashboard &rarr;
          </Button>
        </div>
        <UserStoreBrowsePage />
      </div>
    );
  }

  // Guest view
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
            Sign in as a <strong>Normal User</strong> to rate stores, update reviews, and view your personalized rating dashboard.
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
