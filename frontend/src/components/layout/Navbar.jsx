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
    <div className="clay-navbar-container">
      <header className="clay-navbar">
        {/* Brand Logo with 3D Convex Clay Orb */}
        <div
          onClick={() => onNavigate('home')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div className="clay-orb clay-orb-purple" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
            ⭐
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--clay-text-primary)',
            }}
          >
            Store<span style={{ color: 'var(--clay-accent-primary)' }}>Rate</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => onNavigate('home')}
            className={`clay-nav-link ${currentRoute === 'home' ? 'active' : ''}`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('stores')}
            className={`clay-nav-link ${currentRoute === 'stores' ? 'active' : ''}`}
          >
            Stores Directory
          </button>

          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`clay-nav-link ${currentRoute === 'dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginLeft: '0.5rem',
                  paddingLeft: '0.85rem',
                  borderLeft: '2px solid rgba(124, 58, 237, 0.12)',
                }}
              >
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: 'var(--clay-text-primary)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {user.name}
                  </div>
                  <Badge role={user.role} />
                </div>

                <button
                  onClick={handleLogout}
                  className="clay-btn clay-btn-secondary clay-btn-sm"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem', marginLeft: '0.5rem' }}>
              <button
                onClick={() => onNavigate('login')}
                className="clay-btn clay-btn-secondary clay-btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="clay-btn clay-btn-primary clay-btn-sm"
              >
                Register
              </button>
            </div>
          )}
        </nav>
      </header>
    </div>
  );
};
