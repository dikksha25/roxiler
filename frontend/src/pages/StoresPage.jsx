import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserStoreBrowsePage } from '../components/user/UserStoreBrowsePage';
import { Button } from '../components/common/Button';

export const StoresPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  // If authenticated, render full store browsing & rating interface
  if (isAuthenticated) {
    return <UserStoreBrowsePage />;
  }

  // Guest view with sign-in prompt
  return (
    <div className="clay-page">
      <div className="clay-container">
        <div
          className="clay-card clay-card-hero"
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(244, 241, 250, 0.8) 100%)',
          }}
        >
          <div>
            <span className="clay-badge clay-badge-purple" style={{ marginBottom: '0.75rem' }}>
              COMMERCIAL DIRECTORY
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', margin: 0, fontWeight: 900 }}>
              🏪 Browse Stores &amp; Ratings
            </h1>
            <p style={{ color: 'var(--clay-text-muted)', margin: '0.65rem 0 0 0', fontSize: '1.05rem', maxWidth: '600px' }}>
              Explore rated community businesses. Sign in to submit verified star feedback and track your personal scores.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
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
    </div>
  );
};
