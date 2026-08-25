import React, { useState, useEffect } from 'react';
import { healthService } from '../../services/healthService';

export const BackendStatusBadge = () => {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | online | error
  const [latency, setLatency] = useState(null);

  const checkBackend = async () => {
    const start = performance.now();
    try {
      const res = await healthService.getHealth();
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      if (res.success && res.data) {
        setHealth(res.data);
        setStatus('online');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.warn('Backend health check error:', err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.45rem 1rem',
        borderRadius: '9999px',
        background: status === 'online' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        boxShadow: status === 'online' ? 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(16, 185, 129, 0.15)' : 'none',
        border: `1.5px solid ${status === 'online' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        fontSize: '0.82rem',
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status === 'online' ? 'var(--clay-success)' : 'var(--clay-danger)',
          boxShadow: status === 'online' ? '0 0 8px rgba(16, 185, 129, 0.6)' : '0 0 8px rgba(239, 68, 68, 0.6)',
          display: 'inline-block',
        }}
      />
      <span>
        {status === 'checking' && 'Pinging Express API...'}
        {status === 'online' && (
          <>
            <span style={{ color: 'var(--clay-success)' }}>API Online</span>
            {latency && (
              <span style={{ color: 'var(--clay-text-dim)', marginLeft: '6px', fontWeight: 500 }}>({latency}ms)</span>
            )}
          </>
        )}
        {status === 'error' && (
          <span style={{ color: 'var(--clay-danger)' }}>API Disconnected</span>
        )}
      </span>
      {health?.database && (
        <span
          className="clay-badge clay-badge-green"
          style={{
            marginLeft: '4px',
            padding: '2px 8px',
            fontSize: '0.72rem',
          }}
          title={health.database.message}
        >
          {health.database.connected ? 'PostgreSQL Ready' : 'Configured'}
        </span>
      )}
    </div>
  );
};
