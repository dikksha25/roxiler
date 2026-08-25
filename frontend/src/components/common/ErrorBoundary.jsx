import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 [React ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/home';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'var(--bg-primary, #0f172a)',
            color: 'var(--text-primary, #f8fafc)',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'var(--bg-secondary, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--text-muted, #94a3b8)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              An unexpected application error occurred. You can reload the application to safely recover your session.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              >
                🔄 Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
