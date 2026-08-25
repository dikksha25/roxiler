import api from './api';

export const authService = {
  register: async ({ name, email, password, address, role }) => {
    return await api.post('/auth/register', { name, email, password, address, role });
  },

  login: async ({ email, password }) => {
    return await api.post('/auth/login', { email, password });
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },
};
