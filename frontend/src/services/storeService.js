import { api } from './api';

export const storeService = {
  /**
   * List all stores with filtering, sorting, and pagination
   */
  async getStores(params = {}) {
    const res = await api.get('/stores', { params });
    return res.data;
  },

  /**
   * Get single store details with owner and ratings breakdown
   */
  async getStoreById(id) {
    const res = await api.get(`/stores/${id}`);
    return res.data;
  },

  /**
   * Admin creates a new store associated with a STORE_OWNER
   */
  async createStore(storeData) {
    const res = await api.post('/stores', storeData);
    return res.data;
  },

  /**
   * Admin updates store attributes
   */
  async updateStore(id, storeData) {
    const res = await api.patch(`/stores/${id}`, storeData);
    return res.data;
  },

  /**
   * Get stores owned by current STORE_OWNER
   */
  async getMyStores() {
    const res = await api.get('/stores/my-stores');
    return res.data;
  },
};
