/**
 * @file DecisionStatistics.js
 * @description Provides aggregated statistical and analytical metrics for the Decision module.
 */

// Import or fallback to DecisionConstants
let DecisionConstants;
try {
  ({ DecisionConstants } = require('./DecisionEntity.js'));
} catch (e) {
  DecisionConstants = {
    CATEGORIES: ['ANGGARAN_KEUANGAN', 'TATA_TERTIB_LINGKUNGAN', 'KEAMANAN_RONDA', 'KEBERSIHAN_INFRASTRUKTUR', 'KEGIATAN_SOSIAL', 'LAINNYA'],
    STATUSES: ['DRAFT', 'RATIFIED', 'SUPERSEDED', 'REVOKED'],
    TARGET_TYPES: ['ALL_CITIZENS', 'FAMILY_HEADS', 'SPECIFIC_RT', 'MERCHANTS', 'COMMITTEE'],
  };
}

class DecisionStatistics {
  /**
   * @param {DecisionRepository} repository
   * @param {object} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('decision_stats') : null;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('DecisionStatistics') : console;
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes cache
  }

  /**
   * Retrieves high-level operational summary metrics for decisions.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getSummary(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    const cacheKey = `summary_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const decisions = this.repository.searchDecisions(filters) || [];

    const totalDecisions = decisions.length;
    const draftDecisions = decisions.filter(d => d.status === 'DRAFT').length;
    const ratifiedDecisions = decisions.filter(d => d.status === 'RATIFIED').length;
    const supersededDecisions = decisions.filter(d => d.status === 'SUPERSEDED').length;
    const revokedDecisions = decisions.filter(d => d.status === 'REVOKED').length;
    const activeRate = totalDecisions > 0 ? Number(((ratifiedDecisions / totalDecisions) * 100).toFixed(1)) : 0;

    const summary = {
      totalDecisions,
      draftDecisions,
      ratifiedDecisions,
      supersededDecisions,
      revokedDecisions,
      activeRate: `${activeRate}%`,
      activeRateValue: activeRate,
    };

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    }

    return summary;
  }

  /**
   * Calculates the distribution of decisions by category.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getCategoryDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    const cacheKey = `cat_dist_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const decisions = this.repository.searchDecisions(filters) || [];
    const categories = (DecisionConstants && DecisionConstants.CATEGORIES) || [];

    const distribution = categories.map(cat => {
      const count = decisions.filter(d => d.category === cat).length;
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
   * Calculates the distribution of target impacts.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getTargetTypeDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    const cacheKey = `target_dist_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const targetTypes = (DecisionConstants && DecisionConstants.TARGET_TYPES) || [];
    const decisions = this.repository.searchDecisions(filters) || [];

    let allImpacts = [];
    if (this.repository.impactTableName && this.repository.dbAdapter && typeof this.repository.dbAdapter.search === 'function') {
      allImpacts = this.repository.dbAdapter.search(this.repository.impactTableName, { deletedAt: null }) || [];
    }

    // Filter impacts belonging to relevant decisions if filtered
    if (Object.keys(filters).length > 0) {
      const validDecisionIds = new Set(decisions.map(d => d.id));
      allImpacts = allImpacts.filter(imp => validDecisionIds.has(imp.decisionId));
    }

    const distribution = targetTypes.map(target => {
      const count = allImpacts.filter(i => i.targetType === target).length;
      return {
        name: this._formatLabel(target),
        code: target,
        value: count,
      };
    });

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, distribution, this.defaultCacheTTL);
    }

    return distribution;
  }

  /**
   * Calculates the distribution of decisions by lifecycle status.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getStatusDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    const decisions = this.repository.searchDecisions(filters) || [];
    const statuses = (DecisionConstants && DecisionConstants.STATUSES) || [];

    return statuses.map(status => ({
      name: this._formatLabel(status),
      code: status,
      value: decisions.filter(d => d.status === status).length,
    }));
  }

  /**
   * Retrieves recently ratified decisions.
   * @param {number} [limit=5] - Number of decisions.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getRecentDecisions(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    const decisions = this.repository.searchDecisions({ ...filters, status: 'RATIFIED' }) || [];

    return decisions
      .slice()
      .sort((a, b) => new Date(b.effectiveDate || b.createdAt || 0) - new Date(a.effectiveDate || a.createdAt || 0))
      .slice(0, limit)
      .map(d => ({
        id: d.id,
        decisionNumber: d.decisionNumber,
        title: d.title,
        category: d.category,
        scopeId: d.scopeId,
        effectiveDate: d.effectiveDate,
        signatoryCitizenId: d.signatoryCitizenId,
      }));
  }

  /**
   * Retrieves decision ratification trends from AnalyticsService.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getDecisionTrend(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('decision.statistics.view');
    }

    if (this.analyticsService && typeof this.analyticsService.getTimeSeries === 'function') {
      return this.analyticsService.getTimeSeries({
        metric: 'decision_ratified',
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

module.exports = DecisionStatistics;

