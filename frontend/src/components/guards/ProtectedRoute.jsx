import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ProtectedRoute = ({ children, allowedRoles = [], onNavigateToLogin }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Card style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', color: '#f87171' }}>Authentication Required</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please sign in to your account to view this dashboard area.
        </p>
        <Button variant="primary" onClick={onNavigateToLogin}>
          Sign In Now
        </Button>
      </Card>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <Card style={{ maxWidth: '520px', margin: '3rem auto', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', color: '#fbbf24' }}>Access Restricted</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Your current role (<strong style={{ color: '#fff' }}>{user?.role}</strong>) does not have permission to access this section.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Required roles: {allowedRoles.join(', ')}
        </p>
      </Card>
    );
  }

  return children;
};
