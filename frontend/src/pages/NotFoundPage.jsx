import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const NotFoundPage = ({ onNavigate }) => {
  return (
    <div className="fade-in" style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center' }}>
      <Card>
        <h1 style={{ fontSize: '4rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
          The page or view you are looking for does not exist.
        </p>
        <Button variant="primary" onClick={() => onNavigate('home')}>
          Return to Home
        </Button>
      </Card>
    </div>
  );
};
