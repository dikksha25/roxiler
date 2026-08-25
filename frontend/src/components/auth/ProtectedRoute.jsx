import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../common/Spinner';
import { UnauthorizedPage } from '../../pages/UnauthorizedPage';

export const ProtectedRoute = ({ children, allowedRoles = [], onNavigate }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
        }}
      >
        <Spinner size={40} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Verifying security session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🔒 Authentication Required</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please sign in to access this protected area.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate && onNavigate('login')}
        >
          Sign In Now &rarr;
        </button>
      </div>
    );
  }

  // Check role authorization if restricted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <UnauthorizedPage
        userRole={user.role}
        allowedRoles={allowedRoles}
        onNavigate={onNavigate}
      />
    );
  }

  return children;
};
