import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token & correlation ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('store_rating_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach correlation ID if not present
    if (!config.headers['X-Request-Id']) {
      const reqId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'req_' + Math.random().toString(36).substring(2, 11);
      config.headers['X-Request-Id'] = reqId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      const currentToken = localStorage.getItem('store_rating_token');
      if (currentToken) {
        localStorage.removeItem('store_rating_token');
        localStorage.removeItem('store_rating_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
