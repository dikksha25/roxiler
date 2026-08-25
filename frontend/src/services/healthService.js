import api from './api';

export const healthService = {
  getHealth: async () => {
    return await api.get('/health');
  },
};
