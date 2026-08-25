import React from 'react';
import { Button } from '../components/common/Button';

export const HomePage = ({ onNavigate }) => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '5rem 1rem 4rem' }}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '2rem',
            background: 'linear-gradient(to right, #ffffff, #e0e7ff, #c7d2fe)',
            WebkitBackgroundClip: 'text',
          }}
        >
          Modern Store Rating &amp; Review Platform
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => onNavigate('stores')} style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Explore Stores &rarr;
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('login')} style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Sign In
          </Button>
        </div>
      </section>
    </div>
  );
};
