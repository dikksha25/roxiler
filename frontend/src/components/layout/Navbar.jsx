import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BackendStatusBadge } from '../common/BackendStatusBadge';
import { ROLE_BADGE_VARIANTS, ROLE_LABELS } from '../../constants/roles';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              StoreRate
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block', marginTop: '-4px', fontWeight: 600 }}>
              PLATFORM FOUNDATION
            </span>
          </div>
        </div>

        {/* Live Backend Connection Indicator */}
        <BackendStatusBadge />

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentView('home')}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              background: currentView === 'home' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: currentView === 'home' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            Home
          </button>

          <button
            onClick={() => setCurrentView('stores')}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              background: currentView === 'stores' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: currentView === 'stores' ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            Browse Stores
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                background: currentView === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: currentView === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
              }}
            >
              Dashboard
            </button>
          )}

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</span>
                <Badge variant={ROLE_BADGE_VARIANTS[user?.role] || 'user'}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </Badge>
              </div>
              <Button
                variant="danger"
                onClick={() => {
                  logout();
                  setCurrentView('home');
                }}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentView('login')}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentView('register')}
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
              >
                Register
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
