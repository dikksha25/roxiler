import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('store_rating_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network request failed';

    // If 401 Unauthorized, token might be expired
    if (error.response?.status === 401 && localStorage.getItem('store_rating_token')) {
      localStorage.removeItem('store_rating_token');
      localStorage.removeItem('store_rating_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
