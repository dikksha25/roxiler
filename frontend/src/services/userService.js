import { api } from './api';

export const userService = {
  /**
   * List users with multi-criteria filtering, sorting, and pagination
   */
  async getUsers(params = {}) {
    const res = await api.get('/users', { params });
    return res.data;
  },

  /**
   * Get single user details by ID
   */
  async getUserById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  /**
   * Admin creates a new user with chosen role
   */
  async createUser(userData) {
    const res = await api.post('/users', userData);
    return res.data;
  },

  /**
   * Update authenticated user's own profile
   */
  async updateProfile(profileData) {
    const res = await api.patch('/users/profile', profileData);
    return res.data;
  },
};
