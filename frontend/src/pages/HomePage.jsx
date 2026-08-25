import React from 'react';
import { Button } from '../components/common/Button';

export const HomePage = ({ onNavigate }) => {
  return (
    <div className="clay-page">
      <div className="clay-container">
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '3.5rem 1rem 4.5rem', position: 'relative' }}>
          {/* Floating Pill Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span className="clay-badge clay-badge-purple" style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem' }}>
              ✨ High-Fidelity Claymorphism Experience
            </span>
          </div>

          {/* Display Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 4.85rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto 1.5rem',
            }}
          >
            Tactile Store Ratings &amp; <span className="clay-text-gradient">Real-Time Reviews</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              color: 'var(--clay-text-muted)',
              lineHeight: 1.6,
            }}
          >
            Discover top-rated local merchants, share authenticated customer reviews, and empower store owners with live rating telemetry.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('stores')}
            >
              Explore Stores Directory &rarr;
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('register')}
            >
              Create Free Account
            </Button>
          </div>

          {/* 4 Interactive Stat Orbs */}
          <div className="clay-grid-4" style={{ marginTop: '2rem' }}>
            <div className="clay-card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div className="clay-orb clay-orb-purple" style={{ margin: '0 auto 1rem', width: '52px', height: '52px', fontSize: '1.4rem' }}>
                ⭐
              </div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.25rem' }}>4.8 ★</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--clay-text-muted)' }}>
                Average Platform Rating
              </p>
            </div>

            <div className="clay-card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div className="clay-orb clay-orb-pink" style={{ margin: '0 auto 1rem', width: '52px', height: '52px', fontSize: '1.4rem' }}>
                🏪
              </div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.25rem' }}>100%</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--clay-text-muted)' }}>
                Verified Store Registry
              </p>
            </div>

            <div className="clay-card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div className="clay-orb clay-orb-blue" style={{ margin: '0 auto 1rem', width: '52px', height: '52px', fontSize: '1.4rem' }}>
                🛡️
              </div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.25rem' }}>3-Role</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--clay-text-muted)' }}>
                RBAC Governance
              </p>
            </div>

            <div className="clay-card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div className="clay-orb clay-orb-green" style={{ margin: '0 auto 1rem', width: '52px', height: '52px', fontSize: '1.4rem' }}>
                ⚡
              </div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.25rem' }}>Real-Time</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--clay-text-muted)' }}>
                Instant Score Sync
              </p>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section style={{ padding: '2rem 0 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="clay-badge clay-badge-pink" style={{ marginBottom: '0.75rem' }}>
              PLATFORM CAPABILITIES
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, margin: 0 }}>
              Engineered for Every User Role
            </h2>
          </div>

          <div className="clay-grid-3">
            {/* Feature 1: Normal User */}
            <div className="clay-card">
              <div className="clay-orb clay-orb-purple" style={{ marginBottom: '1.25rem' }}>
                🛍️
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.75rem' }}>
                Normal Users
              </h3>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Browse stores with live debounced search, submit 1-to-5 star feedback, modify personal ratings, and track your submitted review history.
              </p>
              <span className="clay-badge clay-badge-purple">One-Rating Rule Enforced</span>
            </div>

            {/* Feature 2: Store Owner */}
            <div className="clay-card">
              <div className="clay-orb clay-orb-pink" style={{ marginBottom: '1.25rem' }}>
                📊
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.75rem' }}>
                Store Owners
              </h3>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Monitor store ratings in real-time, inspect 1-5 star distribution charts, and review customer feedback with strict multi-tenant data isolation.
              </p>
              <span className="clay-badge clay-badge-pink">Live Analytics Dashboard</span>
            </div>

            {/* Feature 3: System Admin */}
            <div className="clay-card">
              <div className="clay-orb clay-orb-blue" style={{ marginBottom: '1.25rem' }}>
                👑
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.75rem' }}>
                System Admins
              </h3>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Manage all registered users and stores, create accounts across all roles, monitor platform metrics, and inspect user profiles.
              </p>
              <span className="clay-badge clay-badge-blue">Full Platform Governance</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
