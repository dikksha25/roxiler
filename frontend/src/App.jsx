import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';

export function AppContent() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={setCurrentView} />;
      case 'stores':
        return <StoresPage onNavigate={setCurrentView} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentView} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentView} />;
      case 'dashboard':
        return (
          <ProtectedRoute onNavigateToLogin={() => setCurrentView('login')}>
            <DashboardPage onNavigate={setCurrentView} />
          </ProtectedRoute>
        );
      default:
        return <NotFoundPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">{renderView()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
