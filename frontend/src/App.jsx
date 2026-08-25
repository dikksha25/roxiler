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
      <div className="app-container">
        <Navbar currentRoute={currentRoute} onNavigate={navigate} />
        <main className="main-content">{renderRoute()}</main>
        <footer
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--text-dim)',
            fontSize: '0.875rem',
            marginTop: 'auto',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ margin: 0 }}>
              &copy; {new Date().getFullYear()} Store Rating Web Platform. Enterprise Architecture. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
