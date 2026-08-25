import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const getInitialRoute = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  const validRoutes = ['home', 'stores', 'login', 'register', 'dashboard'];
  return validRoutes.includes(hash) ? hash : 'home';
};

export function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  // Synchronize route changes with browser history & URL hash
  const navigate = (route) => {
    setCurrentRoute(route);
    window.location.hash = `/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update document.title according to active route
  useEffect(() => {
    const routeTitles = {
      home: 'StoreRate — Home',
      stores: 'StoreRate — Browse Stores & Ratings',
      login: 'StoreRate — User Login',
      register: 'StoreRate — Account Registration',
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

  const renderRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'stores':
        return <StoresPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <DashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
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
              &copy; {new Date().getFullYear()} <span style={{ color: 'var(--clay-accent-primary)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>StoreRate</span> — High-Fidelity Claymorphism Experience.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
