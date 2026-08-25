const userRepository = require('../database/repositories/user.repository');
const storeRepository = require('../database/repositories/store.repository');
const ratingRepository = require('../database/repositories/rating.repository');
const { ROLES } = require('../constants/roles.constant');

class DashboardService {
  /**
   * Get role-aware dashboard overview
   */
  async getDashboardData(user) {
    if (user.role === ROLES.SYSTEM_ADMIN) {
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        userRepository.count(),
        storeRepository.count(),
        ratingRepository.count(),
      ]);

      return {
        role: ROLES.SYSTEM_ADMIN,
        metrics: {
          totalUsers,
          totalStores,
          totalRatings,
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (user.role === ROLES.STORE_OWNER) {
      const stores = await storeRepository.findByOwnerId(user.id);
      const totalStores = stores.length;
      const totalReviewsReceived = stores.reduce((acc, s) => acc + (parseInt(s.rating_count, 10) || 0), 0);
      const averagePlatformRating =
        totalStores > 0
          ? (
              stores.reduce((acc, s) => acc + parseFloat(s.average_rating || 0), 0) /
              totalStores
            ).toFixed(2)
          : '0.00';

      return {
        role: ROLES.STORE_OWNER,
        metrics: {
          totalStores,
          totalReviewsReceived,
          averagePlatformRating: parseFloat(averagePlatformRating),
        },
        stores,
        timestamp: new Date().toISOString(),
      };
    }

    // NORMAL_USER
    const { items: myRatings, total: totalRatingsGiven } =
      await ratingRepository.findUserRatingsPaginated(user.id, { limit: 5, offset: 0 });

    return {
      role: ROLES.NORMAL_USER,
      metrics: {
        totalRatingsGiven,
      },
      recentRatings: myRatings,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new DashboardService();
