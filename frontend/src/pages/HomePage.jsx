import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { healthService } from '../services/healthService';
import { ROLES, ROLE_LABELS } from '../constants/roles';

export const HomePage = ({ onNavigate }) => {
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await healthService.getHealth();
        if (res.data) {
          setHealthData(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch backend health:', err.message);
      } finally {
        setLoadingHealth(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <Badge variant="admin">Full-Stack Architecture Foundation</Badge>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            background: 'linear-gradient(to right, #ffffff via-indigo-100 to-indigo-300, #c7d2fe)',
            WebkitBackgroundClip: 'text',
          }}
        >
          Modern Store Rating &amp; Review Platform
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          A scalable multi-tier web application built with <strong>React.js</strong>, <strong>Express.js</strong>, <strong>PostgreSQL</strong>, and <strong>JWT Role-Based Authentication</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => onNavigate('stores')} style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Explore Stores &rarr;
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('login')} style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Sign In / Demo Roles
          </Button>
        </div>
      </section>

      {/* Live Full-Stack Health & Verification Card */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Card style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Full-Stack Live Connectivity Verification
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Demonstrates real-time communication between React Frontend &amp; Express REST Backend
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge variant={healthData ? 'success' : 'warning'}>
                {healthData ? 'API Online' : 'Connecting...'}
              </Badge>
              <Badge variant={healthData?.database?.connected ? 'success' : 'warning'}>
                {healthData?.database?.connected ? 'PostgreSQL Active' : 'DB Configured'}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Frontend</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>React 18 + Vite</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Port: 5173</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Backend Service</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>Express 4 + Node</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Uptime: {healthData ? `${healthData.uptimeSeconds}s` : '...'}
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Database</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', marginTop: '0.25rem' }}>PostgreSQL DDL</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: {healthData?.database?.databaseName || 'store_rating_db'}
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Authentication</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f472b6', marginTop: '0.25rem' }}>JWT + Bcrypt</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3-Tier RBAC</span>
            </div>
          </div>
        </Card>
      </section>

      {/* User Roles & Permissions Overview */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Multi-Role Architecture</h2>
          <p style={{ color: 'var(--text-muted)' }}>Tailored capabilities designed for three distinct platform actors</p>
        </div>

        <div className="grid-cards">
          {/* Admin Role */}
          <Card interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Badge variant="admin">Role 1</Badge>
              <span style={{ fontSize: '1.75rem' }}>🛡️</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{ROLE_LABELS[ROLES.SYSTEM_ADMIN]}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', minHeight: '60px' }}>
              Manages all registered users, creates stores, monitors platform health, and accesses global rating metrics.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <li>✓ Manage system users &amp; roles</li>
              <li>✓ Create and oversee all stores</li>
              <li>✓ Platform analytics &amp; stats</li>
            </ul>
          </Card>

          {/* Normal User Role */}
          <Card interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Badge variant="user">Role 2</Badge>
              <span style={{ fontSize: '1.75rem' }}>⭐</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{ROLE_LABELS[ROLES.NORMAL_USER]}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', minHeight: '60px' }}>
              Registers an account, browses verified stores, and submits or updates 1-to-5 star ratings with feedback.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <li>✓ Self-service user registration</li>
              <li>✓ Browse &amp; search store directory</li>
              <li>✓ Submit &amp; edit ratings (1–5 stars)</li>
            </ul>
          </Card>

          {/* Store Owner Role */}
          <Card interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Badge variant="owner">Role 3</Badge>
              <span style={{ fontSize: '1.75rem' }}>🏪</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{ROLE_LABELS[ROLES.STORE_OWNER]}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', minHeight: '60px' }}>
              Manages designated store profile, views feedback submitted by customers, and tracks real-time average ratings.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <li>✓ Store profile management</li>
              <li>✓ View customer ratings &amp; reviews</li>
              <li>✓ Track store average rating score</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
};
