import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Spinner } from './components/common/Spinner';

const getInitialRoute = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  const validRoutes = ['login', 'register', 'dashboard', 'stores', 'home'];
  // Login is the mandatory default landing page
  return validRoutes.includes(hash) ? hash : 'login';
};

function AppLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  // Synchronize route changes with browser history & URL hash
  const navigate = (route) => {
    setCurrentRoute(route);
    window.location.hash = `/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enforce strict authentication gating across all routes
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Unauthenticated users can ONLY access 'login' and 'register'
        if (currentRoute !== 'login' && currentRoute !== 'register') {
          navigate('login');
        }
      } else {
        // Authenticated users should not land on login/register
        if (currentRoute === 'login' || currentRoute === 'register') {
          navigate('dashboard');
        }
      }
    }
  }, [isAuthenticated, loading, currentRoute]);

  // Update document.title according to active route
  useEffect(() => {
    const routeTitles = {
      login: 'StoreRate — User Sign In',
      register: 'StoreRate — Account Registration',
      home: 'StoreRate — Home',
      stores: 'StoreRate — Browse Stores & Ratings',
      dashboard: 'StoreRate — Enterprise Dashboard',
    };
    document.title = routeTitles[currentRoute] || 'StoreRate — Store Rating Platform';
  }, [currentRoute]);

  // Listen to browser Back/Forward buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const route = getInitialRoute();
      setCurrentRoute(route);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1.25rem',
        }}
      >
        <Spinner size={52} />
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--clay-text-primary)',
          }}
        >
          Verifying Security Session...
        </span>
      </div>
    );
  }

  const renderRoute = () => {
    // If not authenticated, only allow login & register
    if (!isAuthenticated) {
      if (currentRoute === 'register') {
        return <RegisterPage onNavigate={navigate} />;
      }
      return <LoginPage onNavigate={navigate} />;
    }

    // Authenticated views (all protected)
    switch (currentRoute) {
      case 'home':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <HomePage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case 'stores':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <StoresPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case 'dashboard':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <DashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute onNavigate={navigate}>
            <DashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <>
      <div className="clay-bg-canvas" aria-hidden="true">
        <div className="clay-bg-blob clay-blob-1" />
        <div className="clay-bg-blob clay-blob-2" />
        <div className="clay-bg-blob clay-blob-3" />
      </div>
      <div className="app-container">
        <Navbar currentRoute={currentRoute} onNavigate={navigate} />
        <main className="main-content">{renderRoute()}</main>
        <footer
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            color: 'var(--clay-text-muted)',
            fontSize: '0.95rem',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div className="clay-container">
            <p style={{ margin: 0, fontWeight: 600 }}>
              &copy; {new Date().getFullYear()} <span style={{ color: 'var(--clay-accent-primary)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>StoreRate</span> — High-Fidelity Dual-Theme Experience.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
