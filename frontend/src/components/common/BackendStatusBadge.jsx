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
        padding: '0.45rem 0.9rem',
        borderRadius: 'var(--radius-full)',
        background: status === 'online' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${status === 'online' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      <span className={`pulse-dot ${status === 'online' ? 'online' : 'offline'}`} />
      <span>
        {status === 'checking' && 'Pinging Express API...'}
        {status === 'online' && (
          <>
            <span style={{ color: '#34d399' }}>Backend Connected</span>
            {latency && (
              <span style={{ color: 'var(--text-dim)', marginLeft: '6px' }}>({latency}ms)</span>
            )}
          </>
        )}
        {status === 'error' && (
          <span style={{ color: '#f87171' }}>Backend Offline / Disconnected</span>
        )}
      </span>
      {health?.database && (
        <span
          style={{
            marginLeft: '4px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            background: health.database.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: health.database.connected ? '#6ee7b7' : '#fcd34d',
          }}
          title={health.database.message}
        >
          DB: {health.database.connected ? 'PostgreSQL Ready' : 'Configured'}
        </span>
      )}
    </div>
  );
};
