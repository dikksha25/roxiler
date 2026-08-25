import { api } from './api';

export const authService = {
  /**
   * Universal Login for all three roles
   */
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  /**
   * Normal User Self-Registration
   */
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getProfile() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  /**
   * Update user password
   */
  async updatePassword(currentPassword, newPassword) {
    const res = await api.patch('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  /**
   * Logout session
   */
  async logout() {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } catch {
      // Ignore network errors on logout
      return { success: true };
    }
  },
};
