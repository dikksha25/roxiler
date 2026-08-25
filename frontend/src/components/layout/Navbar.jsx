import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar = ({ currentRoute, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="clay-navbar-container">
      <header className="clay-navbar">
        {/* Brand Logo with 3D Convex Clay Orb */}
        <div
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
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

        {/* Navigation Links & Controls */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isAuthenticated && user ? (
            <>
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
                  borderLeft: '2px solid var(--border-subtle)',
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

                <ThemeToggle />

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.5rem' }}>
              <ThemeToggle />
              <button
                onClick={() => onNavigate('login')}
                className={`clay-btn ${currentRoute === 'login' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className={`clay-btn ${currentRoute === 'register' ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
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
