import { api } from './api';

export const ratingService = {
  /**
   * Submit a new rating for a store (NORMAL_USER)
   */
  async submitRating({ storeId, ratingValue, comment }) {
    const res = await api.post('/ratings', {
      storeId: parseInt(storeId, 10),
      store_id: parseInt(storeId, 10),
      ratingValue: parseInt(ratingValue, 10),
      rating: parseInt(ratingValue, 10),
      comment: comment ? comment.trim() : null,
    });
    return res.data;
  },

  /**
   * Modify an existing rating for a store (NORMAL_USER)
   */
  async modifyRating(ratingId, { ratingValue, comment }) {
    const res = await api.patch(`/ratings/${ratingId}`, {
      ratingValue: parseInt(ratingValue, 10),
      rating: parseInt(ratingValue, 10),
      comment: comment ? comment.trim() : null,
    });
    return res.data;
  },

  /**
   * Get ratings submitted by current user
   */
  async getMyRatings() {
    const res = await api.get('/ratings/my-ratings');
    return res.data;
  },
};
