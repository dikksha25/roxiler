const { query } = require('../database/connection');
const userRepository = require('../database/repositories/user.repository');
const storeRepository = require('../database/repositories/store.repository');
const ratingRepository = require('../database/repositories/rating.repository');
const { ROLES } = require('../constants/roles.constant');
const ForbiddenError = require('../errors/forbidden.error');
const NotFoundError = require('../errors/notFound.error');

class DashboardService {
  /**
   * Retrieve high-performance aggregated metrics for System Administrator
   */
  async getAdminMetrics() {
    try {
      // 1. Single optimized SQL aggregation query for global platform counts
      const statsRes = await query(`
        SELECT 
          (SELECT COUNT(*)::int FROM users) AS total_users,
          (SELECT COUNT(*)::int FROM stores) AS total_stores,
          (SELECT COUNT(*)::int FROM ratings) AS total_ratings,
          (SELECT COALESCE(ROUND(AVG(rating_value)::numeric, 2), 0.00) FROM ratings) AS average_rating,
          (SELECT COUNT(*)::int FROM users WHERE role = 'SYSTEM_ADMIN') AS admin_count,
          (SELECT COUNT(*)::int FROM users WHERE role = 'STORE_OWNER') AS owner_count,
          (SELECT COUNT(*)::int FROM users WHERE role = 'NORMAL_USER') AS user_count
      `);

      const statsRow = statsRes.rows[0] || {};

      // 2. Fetch recent platform records for admin monitoring
      const recentUsersRes = await query(`
        SELECT id, name, email, role, address, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      const recentStoresRes = await query(`
        SELECT s.id, s.name, s.email, s.address, s.created_at,
               u.name AS owner_name,
               COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
               COUNT(r.id)::int AS rating_count
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        LEFT JOIN ratings r ON s.id = r.store_id
        GROUP BY s.id, u.name
        ORDER BY s.created_at DESC
        LIMIT 5
      `);

      const recentRatingsRes = await query(`
        SELECT r.id, r.rating_value, r.comment, r.created_at,
               u.name AS user_name,
               s.name AS store_name
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `);

      return {
        stats: {
          totalUsers: statsRow.total_users || 0,
          totalStores: statsRow.total_stores || 0,
          totalRatings: statsRow.total_ratings || 0,
          averageRating: statsRow.average_rating || '0.00',
        },
        roleBreakdown: {
          adminCount: statsRow.admin_count || 0,
          ownerCount: statsRow.owner_count || 0,
          userCount: statsRow.user_count || 0,
        },
        recentUsers: recentUsersRes.rows || [],
        recentStores: recentStoresRes.rows || [],
        recentRatings: recentRatingsRes.rows || [],
      };
    } catch (err) {
      // Resilient development fallback when PostgreSQL is offline
      const allUsers = userRepository.inMemoryUsers || [];
      const allStores = storeRepository.inMemoryStores || [];
      const allRatings = ratingRepository.inMemoryRatings || [];

      const adminCount = allUsers.filter((u) => u.role === ROLES.SYSTEM_ADMIN).length;
      const ownerCount = allUsers.filter((u) => u.role === ROLES.STORE_OWNER).length;
      const userCount = allUsers.filter((u) => u.role === ROLES.NORMAL_USER).length;

      const totalRatingVal = allRatings.reduce((acc, r) => acc + (r.rating_value || r.rating || 0), 0);
      const avgRating = allRatings.length > 0 ? (totalRatingVal / allRatings.length).toFixed(2) : '0.00';

      const recentUsers = allUsers
        .slice()
        .reverse()
        .slice(0, 5)
        .map(({ password_hash: _, ...safe }) => safe);

      const recentStores = allStores.slice().reverse().slice(0, 5);
      const recentRatings = allRatings.slice().reverse().slice(0, 5);

      return {
        stats: {
          totalUsers: allUsers.length,
          totalStores: allStores.length,
          totalRatings: allRatings.length,
          averageRating: avgRating,
        },
        roleBreakdown: {
          adminCount,
          ownerCount,
          userCount,
        },
        recentUsers,
        recentStores,
        recentRatings,
      };
    }
  }

  /**
   * Retrieve telemetry for authenticated Store Owner
   * Returns owned stores, dynamic average rating, rating counts, and customer reviews with user profiles
   */
  async getStoreOwnerMetrics(ownerId) {
    const oId = parseInt(ownerId, 10);
    const owner = await userRepository.findUserProfileById(oId);

    const stores = await storeRepository.findByOwnerId(oId);
    const storeIds = stores.map((s) => s.id);
    const ratingsMap = await ratingRepository.findByStoreIdsWithUserDetails(storeIds);

    let totalRatingsReceived = 0;
    let sumRating = 0;

    const enrichedStores = stores.map((st) => {
      const storeRatings = ratingsMap[st.id] || [];
      const ratingCount = storeRatings.length;

      let avgRating = '0.00';
      if (ratingCount > 0) {
        const totalVal = storeRatings.reduce((acc, r) => acc + r.rating_value, 0);
        avgRating = (totalVal / ratingCount).toFixed(2);
        sumRating += totalVal;
        totalRatingsReceived += ratingCount;
      }

      return {
        id: st.id,
        name: st.name,
        email: st.email,
        address: st.address,
        average_rating: avgRating,
        overall_rating: avgRating,
        rating_count: ratingCount,
        totalRatings: ratingCount,
        created_at: st.created_at,
        ratings: storeRatings,
        customer_ratings: storeRatings,
      };
    });

    const overallAverage =
      totalRatingsReceived > 0 ? (sumRating / totalRatingsReceived).toFixed(2) : '0.00';

    return {
      owner: owner
        ? { id: owner.id, name: owner.name, email: owner.email }
        : { id: oId, name: 'Store Owner', email: '' },
      totalStores: enrichedStores.length,
      storesCount: enrichedStores.length,
      totalRatingsReceived,
      totalReviews: totalRatingsReceived,
      overallAverageRating: overallAverage,
      averageRating: overallAverage,
      stores: enrichedStores,
    };
  }

  /**
   * Retrieve detailed rating statistics and 1-to-5 star distribution for STORE_OWNER
   */
  async getStoreOwnerStatistics(ownerId, requestedStoreId = null) {
    const oId = parseInt(ownerId, 10);
    const owner = await userRepository.findUserProfileById(oId);

    let ownedStores = await storeRepository.findByOwnerId(oId);
    if (owner?.role === 'SYSTEM_ADMIN' && requestedStoreId) {
      const targetStore = await storeRepository.findDetailById(parseInt(requestedStoreId, 10));
      if (targetStore) {
        ownedStores = [targetStore];
      }
    }

    if (requestedStoreId && owner?.role !== 'SYSTEM_ADMIN') {
      const targetSId = parseInt(requestedStoreId, 10);
      const isOwned = ownedStores.some((s) => s.id === targetSId);
      if (!isOwned) {
        throw new ForbiddenError('You do not have permission to view statistics for this store.');
      }
    }

    const storesToAnalyze = requestedStoreId
      ? (owner?.role === 'SYSTEM_ADMIN' ? ownedStores : ownedStores.filter((s) => s.id === parseInt(requestedStoreId, 10)))
      : ownedStores;

    const analyzeIds = storesToAnalyze.map((s) => s.id);
    const ratingsMap = await ratingRepository.findByStoreIdsWithUserDetails(analyzeIds);

    let overallTotalRatings = 0;
    let overallSumRating = 0;
    const overallDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const storeStats = storesToAnalyze.map((st) => {
      const ratings = ratingsMap[st.id] || [];
      const totalRatings = ratings.length;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let storeSum = 0;

      ratings.forEach((r) => {
        const score = parseInt(r.rating_value, 10);
        if (distribution[score] !== undefined) {
          distribution[score] += 1;
          overallDistribution[score] += 1;
        }
        storeSum += score;
      });

      overallTotalRatings += totalRatings;
      overallSumRating += storeSum;

      const avg = totalRatings > 0 ? storeSum / totalRatings : 0;
      const avgTwoDec = avg.toFixed(2);
      const avgOneDec = avg.toFixed(1);

      const distributionPercentages = {
        1: totalRatings > 0 ? Math.round((distribution[1] / totalRatings) * 100) : 0,
        2: totalRatings > 0 ? Math.round((distribution[2] / totalRatings) * 100) : 0,
        3: totalRatings > 0 ? Math.round((distribution[3] / totalRatings) * 100) : 0,
        4: totalRatings > 0 ? Math.round((distribution[4] / totalRatings) * 100) : 0,
        5: totalRatings > 0 ? Math.round((distribution[5] / totalRatings) * 100) : 0,
      };

      return {
        storeId: st.id,
        storeName: st.name,
        storeEmail: st.email,
        storeAddress: st.address,
        averageRating: avgTwoDec,
        averageRatingOneDecimal: avgOneDec,
        totalRatings,
        totalReviews: totalRatings,
        distribution,
        distributionPercentages,
      };
    });

    const overallAvg = overallTotalRatings > 0 ? overallSumRating / overallTotalRatings : 0;
    const overallAvgTwoDec = overallAvg.toFixed(2);
    const overallAvgOneDec = overallAvg.toFixed(1);

    const overallDistributionPercentages = {
      1: overallTotalRatings > 0 ? Math.round((overallDistribution[1] / overallTotalRatings) * 100) : 0,
      2: overallTotalRatings > 0 ? Math.round((overallDistribution[2] / overallTotalRatings) * 100) : 0,
      3: overallTotalRatings > 0 ? Math.round((overallDistribution[3] / overallTotalRatings) * 100) : 0,
      4: overallTotalRatings > 0 ? Math.round((overallDistribution[4] / overallTotalRatings) * 100) : 0,
      5: overallTotalRatings > 0 ? Math.round((overallDistribution[5] / overallTotalRatings) * 100) : 0,
    };

    return {
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : { id: oId, name: 'Store Owner' },
      totalStores: storeStats.length,
      overall: {
        averageRating: overallAvgTwoDec,
        averageRatingOneDecimal: overallAvgOneDec,
        totalRatings: overallTotalRatings,
        totalReviews: overallTotalRatings,
        distribution: overallDistribution,
        distributionPercentages: overallDistributionPercentages,
      },
      stores: storeStats,
    };
  }

  /**
   * Retrieve metrics for Normal User
   */
  async getNormalUserMetrics(userId) {
    try {
      const myRatings = await ratingRepository.findByUserId(userId);
      return {
        submittedRatingsCount: myRatings.length,
        recentRatings: myRatings,
      };
    } catch (err) {
      const myRatings = (ratingRepository.inMemoryRatings || []).filter((r) => r.user_id === parseInt(userId, 10));
      return {
        submittedRatingsCount: myRatings.length,
        recentRatings: myRatings,
      };
    }
  }

  /**
   * Generic adaptive dashboard dispatcher
   */
  async getDashboardData(user) {
    if (user.role === ROLES.SYSTEM_ADMIN) {
      return await this.getAdminMetrics();
    }
    if (user.role === ROLES.STORE_OWNER) {
      return await this.getStoreOwnerMetrics(user.id);
    }
    return await this.getNormalUserMetrics(user.id);
  }
}

module.exports = new DashboardService();
