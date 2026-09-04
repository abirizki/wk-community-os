/**
 * @file AspirationStatistics.js
 * @description Analytics and aggregation layer for Aspiration (Usulan & Musrenbang Warga) module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

const { AspirationConstants } = require('./AspirationEntity.js');

class AspirationStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('aspiration_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('aspiration.statistics.view');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Summary of citizen participation: total proposals, active polling, scheduled discussions, and total votes.
   * @param {Object} filters
   * @returns {Object}
   */
  getParticipationSummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getParticipationSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const aspirations = this.repository ? this.repository.findAllAspirations() : [];

    let totalAspirations = aspirations.length;
    let activePolling = 0;
    let scheduled = 0;
    let accepted = 0;
    let totalVotes = 0;

    aspirations.forEach(asp => {
      totalVotes += (asp.voteCount || 0);

      if (asp.status === 'POLLING') {
        activePolling++;
      } else if (asp.status === 'SCHEDULING' || asp.status === 'IN_DISCUSSION') {
        scheduled++;
      } else if (asp.status === 'ACCEPTED') {
        accepted++;
      }
    });

    const result = {
      totalAspirations,
      activePolling,
      scheduled,
      accepted,
      totalVotes,
      acceptanceRate: totalAspirations > 0 ? ((accepted / totalAspirations) * 100).toFixed(1) : '0.0',
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  /**
   * Distribution of aspirations by category.
   * @param {Object} filters
   * @returns {Array<Object>}
   */
  getCategoryDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getCategoryDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const aspirations = this.repository ? this.repository.findAllAspirations() : [];

    const dist = AspirationConstants.ASPIRATION_CATEGORIES.map(cat => ({
      category: cat,
      count: aspirations.filter(a => a.category === cat).length,
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  /**
   * Top proposals sorted by voteCount descending for Musrenbang deliberation priority.
   * Sanitizes internal audit metadata for presentation security.
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getTopAspirations(limit = 5) {
    this._checkPermission();

    const rawList = this.repository ? this.repository.findAllAspirations() : [];

    // Sort descending by voteCount, then secondary by createdAt descending
    rawList.sort((a, b) => {
      if ((b.voteCount || 0) !== (a.voteCount || 0)) {
        return (b.voteCount || 0) - (a.voteCount || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return rawList.slice(0, limit).map(item => {
      const obj = typeof item.toObject === 'function' ? item.toObject() : item;

      // Mask citizen NIK if available
      let maskedCitizenId = obj.citizenId || '';
      if (maskedCitizenId.length >= 12) {
        maskedCitizenId = '*'.repeat(maskedCitizenId.length - 4) + maskedCitizenId.slice(-4);
      }

      return {
        id: obj.id,
        title: obj.title,
        category: obj.category,
        priority: obj.priority,
        estimatedBudget: obj.estimatedBudget || 0,
        location: obj.location,
        voteCount: obj.voteCount || 0,
        status: obj.status,
        citizenId: maskedCitizenId,
        createdAt: obj.createdAt ? obj.createdAt.slice(0, 10) : '',
      };
    });
  }
}

module.exports = { AspirationStatistics };

