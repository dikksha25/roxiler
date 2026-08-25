import { api } from './api';

export const dashboardService = {
  /**
   * Fetch adaptive dashboard metrics based on authenticated user role
   */
  async getDashboard() {
    const res = await api.get('/dashboard');
    return res.data;
  },

  /**
   * Fetch dedicated System Admin platform metrics
   */
  async getAdminStats() {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },

  /**
   * Fetch Store Owner metrics
   */
  async getOwnerStats() {
    const res = await api.get('/dashboard/owner');
    return res.data;
  },

  /**
   * Fetch Normal User ratings activity
   */
  async getUserStats() {
    const res = await api.get('/dashboard/user');
    return res.data;
  },
};
