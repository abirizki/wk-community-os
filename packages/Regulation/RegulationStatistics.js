/**
 * @file RegulationStatistics.js
 * @description Provides aggregated statistical and analytical metrics for the Regulation module.
 */

// Import or fallback to RegulationConstants
let RegulationConstants;
try {
  ({ RegulationConstants } = require('./RegulationEntity.js'));
} catch (e) {
  RegulationConstants = {
    CATEGORIES: ['TATA_TERTIB', 'KETERTIBAN_KEAMANAN', 'PENGELOLAAN_SAMPAH_LINGKUNGAN', 'PEMANFAATAN_FASUM', 'ADMINISTRASI_WARGA', 'LAINNYA'],
    STATUSES: ['DRAFT', 'UNDER_REVIEW', 'ENACTED', 'SUPERSEDED', 'REVOKED'],
  };
}

class RegulationStatistics {
  /**
   * @param {RegulationRepository} repository
   * @param {object} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('regulation_stats') : null;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('RegulationStatistics') : console;
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes cache
  }

  /**
   * Retrieves high-level operational summary metrics for regulations.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getSummary(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('regulation.statistics.view');
    }

    const cacheKey = `summary_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const regulations = this.repository.searchRegulations(filters) || [];

    const totalRegulations = regulations.length;
    const draftRegulations = regulations.filter(r => r.status === 'DRAFT').length;
    const reviewRegulations = regulations.filter(r => r.status === 'UNDER_REVIEW').length;
    const enactedRegulations = regulations.filter(r => r.status === 'ENACTED').length;
    const supersededRegulations = regulations.filter(r => r.status === 'SUPERSEDED').length;
    const revokedRegulations = regulations.filter(r => r.status === 'REVOKED').length;
    const activeRate = totalRegulations > 0 ? Number(((enactedRegulations / totalRegulations) * 100).toFixed(1)) : 0;

    const summary = {
      totalRegulations,
      draftRegulations,
      reviewRegulations,
      enactedRegulations,
      supersededRegulations,
      revokedRegulations,
      activeRate: `${activeRate}%`,
      activeRateValue: activeRate,
    };

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    }

    return summary;
  }

  /**
   * Calculates the distribution of regulations by category.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getCategoryDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('regulation.statistics.view');
    }

    const cacheKey = `cat_dist_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const regulations = this.repository.searchRegulations(filters) || [];
    const categories = (RegulationConstants && RegulationConstants.CATEGORIES) || [];

    const distribution = categories.map(cat => {
      const count = regulations.filter(r => r.category === cat).length;
      return {
        name: this._formatLabel(cat),
        code: cat,
        value: count,
      };
    });

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, distribution, this.defaultCacheTTL);
    }

    return distribution;
  }

  /**
   * Calculates the distribution of regulations by lifecycle status.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getStatusDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('regulation.statistics.view');
    }

    const regulations = this.repository.searchRegulations(filters) || [];
    const statuses = (RegulationConstants && RegulationConstants.STATUSES) || [];

    return statuses.map(status => ({
      name: this._formatLabel(status),
      code: status,
      value: regulations.filter(r => r.status === status).length,
    }));
  }

  /**
   * Retrieves recently enacted regulations.
   * @param {number} [limit=5] - Number of regulations.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getRecentRegulations(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('regulation.statistics.view');
    }

    const regulations = this.repository.searchRegulations({ ...filters, status: 'ENACTED' }) || [];

    return regulations
      .slice()
      .sort((a, b) => new Date(b.effectiveDate || b.createdAt || 0) - new Date(a.effectiveDate || a.createdAt || 0))
      .slice(0, limit)
      .map(r => ({
        id: r.id,
        regulationNumber: r.regulationNumber,
        title: r.title,
        category: r.category,
        scopeId: r.scopeId,
        effectiveDate: r.effectiveDate,
        enactedDate: r.enactedDate,
        signatoryCitizenId: r.signatoryCitizenId,
      }));
  }

  /**
   * Retrieves regulation promulgation trends from AnalyticsService.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getRegulationTrend(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('regulation.statistics.view');
    }

    if (this.analyticsService && typeof this.analyticsService.getTimeSeries === 'function') {
      return this.analyticsService.getTimeSeries({
        metric: 'regulation_enacted',
        aggregation: 'count',
        period: 'monthly',
        dateRange: filters.dateRange || 'last_12_months',
        filters: filters,
      });
    }

    return { success: true, data: [] };
  }

  /**
   * Converts CONSTANT string to readable label.
   * @private
   */
  _formatLabel(str) {
    if (!str) return '';
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

module.exports = RegulationStatistics;

