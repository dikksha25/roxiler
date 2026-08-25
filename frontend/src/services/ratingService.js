import api from './api';

export const ratingService = {
  submitRating: async ({ storeId, rating, comment }) => {
    return await api.post('/ratings', { storeId, rating, comment });
  },

  getStoreRatings: async (storeId) => {
    return await api.get(`/ratings/store/${storeId}`);
  },

  getMyRatingForStore: async (storeId) => {
    return await api.get(`/ratings/store/${storeId}/my-rating`);
  },
};
