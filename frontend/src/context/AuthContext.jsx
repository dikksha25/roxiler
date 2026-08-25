import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('store_rating_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('store_rating_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize authentication profile on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('store_rating_token');
      if (savedToken) {
        try {
          const res = await authService.getProfile();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('store_rating_user', JSON.stringify(res.data));
          }
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired. Logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Event listener for 401 interceptor trigger
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  /**
   * Universal Login Handler
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      const { user: userData, token: jwtToken } = res.data;

      setUser(userData);
      setToken(jwtToken);

      localStorage.setItem('store_rating_token', jwtToken);
      localStorage.setItem('store_rating_user', JSON.stringify(userData));

      setLoading(false);
      return { success: true, user: userData, role: userData.role };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Normal User Registration Handler
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(userData);
      const { user: newUser, token: jwtToken } = res.data;

      setUser(newUser);
      setToken(jwtToken);

      localStorage.setItem('store_rating_token', jwtToken);
      localStorage.setItem('store_rating_user', JSON.stringify(newUser));

      setLoading(false);
      return { success: true, user: newUser, role: newUser.role };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed.';
      const errors = err.response?.data?.errors || null;
      setError(message);
      return { success: false, message, errors };
    }
  };

  /**
   * Logout Handler
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('store_rating_token');
      localStorage.removeItem('store_rating_user');
    }
  }, []);

  /**
   * Update Password Handler
   */
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await authService.updatePassword(currentPassword, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
