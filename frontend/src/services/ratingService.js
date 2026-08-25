import { api } from './api';

export const ratingService = {
  /**
   * Submit a new rating for a store (NORMAL_USER)
   */
  async submitRating({ storeId, rating, ratingValue, comment }) {
    const sId = parseInt(storeId, 10);
    const score = parseInt(rating !== undefined ? rating : ratingValue, 10);

    const res = await api.post('/ratings', {
      storeId: sId,
      rating: score,
      comment: comment ? comment.trim() : null,
    });
    return res.data;
  },

  /**
   * Modify an existing rating for a store (NORMAL_USER)
   * Targets PUT /api/v1/ratings/:storeId
   */
  async modifyRating(storeId, { rating, ratingValue, comment }) {
    const sId = parseInt(storeId, 10);
    const score = parseInt(rating !== undefined ? rating : ratingValue, 10);

    const res = await api.put(`/ratings/${sId}`, {
      rating: score,
      comment: comment ? comment.trim() : null,
    });
    return res.data;
  },

  /**
   * Reply to a customer review (STORE_OWNER or SYSTEM_ADMIN)
   * Targets POST /api/v1/ratings/:id/reply
   */
  async replyToRating(ratingId, { reply, replyText }) {
    const rId = parseInt(ratingId, 10);
    const res = await api.post(`/ratings/${rId}/reply`, {
      reply: reply !== undefined ? reply : replyText,
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

  /**
   * Get customer ratings list for STORE_OWNER
   */
  async getOwnerRatings(params = {}) {
    const res = await api.get('/ratings/owner-ratings', { params });
    return res.data;
  },
};
