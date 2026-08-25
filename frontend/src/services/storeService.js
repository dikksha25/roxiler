import { api } from './api';

export const storeService = {
  /**
   * Protected store list for authenticated NORMAL_USER (includes user_rating / my_rating)
   */
  async browseStores(params = {}) {
    const res = await api.get('/stores/browse', { params });
    return res.data;
  },

  /**
   * Public / General store directory
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
