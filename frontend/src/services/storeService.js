import api from './api';

export const storeService = {
  getAllStores: async (params = {}) => {
    return await api.get('/stores', { params });
  },

  getStoreById: async (id) => {
    return await api.get(`/stores/${id}`);
  },

  getMyStores: async () => {
    return await api.get('/stores/my-stores');
  },

  createStore: async (storeData) => {
    return await api.post('/stores', storeData);
  },
};
