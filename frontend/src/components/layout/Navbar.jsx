import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const Navbar = ({ currentRoute, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div
          className="brand"
          onClick={() => onNavigate('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
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
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>⭐</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Store<span style={{ color: 'var(--accent-primary)' }}>Rate</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none',
              border: 'none',
              color: currentRoute === 'home' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: currentRoute === 'home' ? 600 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0.4rem 0.6rem',
            }}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('stores')}
            style={{
              background: 'none',
              border: 'none',
              color: currentRoute === 'stores' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: currentRoute === 'stores' ? 600 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0.4rem 0.6rem',
            }}
          >
            Stores Directory
          </button>

          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentRoute === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: currentRoute === 'dashboard' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '0.4rem 0.6rem',
                }}
              >
                Dashboard
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginLeft: '0.5rem',
                  paddingLeft: '0.75rem',
                  borderLeft: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <Badge role={user.role} />
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.75rem',
                    marginLeft: '0.35rem',
                  }}
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
              >
                Register
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
