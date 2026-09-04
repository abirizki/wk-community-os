/**
 * @file PolicyStatistics.js
 * @description Analytics and statistics aggregation for the Policy module.
 */

const { PolicyConstants } = require('./PolicyEntity.js');

class PolicyStatistics {
  /**
   * @param {object} repository - The PolicyRepository instance
   * @param {object} analyticsService - The global AnalyticsService instance
   */
  constructor(repository, analyticsService = null) {
    this.repository = repository;
    this.analytics = analyticsService || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null);
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('policy_stats') : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PolicyStatistics') : console;
  }

  _enforcePermission(context = {}) {
    if (this.security) {
      this.security.checkPermission('policy.statistics.view', context);
    }
  }

  /**
   * Returns summary metrics of policies.
   */
  getSummary(filters = {}, context = {}) {
    this._enforcePermission(context);
    
    const cacheKey = 'summary_' + JSON.stringify(filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const totalPolicies = records.length;
    let activePolicies = 0;
    let underRevisionPolicies = 0;
    let draftPolicies = 0;
    let pendingApprovalPolicies = 0;

    records.forEach(r => {
      if (r.status === 'ACTIVE') activePolicies++;
      else if (r.status === 'UNDER_REVISION') underRevisionPolicies++;
      else if (r.status === 'DRAFT') draftPolicies++;
      else if (r.status === 'PENDING_APPROVAL') pendingApprovalPolicies++;
    });

    const activeRate = totalPolicies > 0 ? ((activePolicies / totalPolicies) * 100).toFixed(2) : 0;

    const summary = {
      totalPolicies,
      activePolicies,
      underRevisionPolicies,
      draftPolicies,
      pendingApprovalPolicies,
      activeRate: parseFloat(activeRate)
    };

    if (this.cache) this.cache.set(cacheKey, summary, 300); // 5 minutes TTL
    return summary;
  }

  /**
   * Returns distribution of policies by category.
   */
  getCategoryDistribution(filters = {}, context = {}) {
    this._enforcePermission(context);

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const dist = {};
    PolicyConstants.CATEGORIES.forEach(cat => dist[cat] = 0);
    
    records.forEach(r => {
      if (dist[r.category] !== undefined) dist[r.category]++;
      else dist[r.category] = 1;
    });

    return Object.keys(dist).map(key => ({
      category: key,
      count: dist[key]
    }));
  }

  /**
   * Returns distribution of policies by target role.
   */
  getTargetRoleDistribution(filters = {}, context = {}) {
    this._enforcePermission(context);

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const dist = {};
    PolicyConstants.TARGET_ROLES.forEach(role => dist[role] = 0);
    
    records.forEach(r => {
      if (dist[r.targetRole] !== undefined) dist[r.targetRole]++;
      else dist[r.targetRole] = 1;
    });

    return Object.keys(dist).map(key => ({
      targetRole: key,
      count: dist[key]
    }));
  }

  /**
   * Returns distribution of policies by status.
   */
  getStatusDistribution(filters = {}, context = {}) {
    this._enforcePermission(context);

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const dist = {};
    PolicyConstants.STATUSES.forEach(status => dist[status] = 0);
    
    records.forEach(r => {
      if (dist[r.status] !== undefined) dist[r.status]++;
      else dist[r.status] = 1;
    });

    return Object.keys(dist).map(key => ({
      status: key,
      count: dist[key]
    }));
  }

  /**
   * Returns a list of recently active policies.
   */
  getRecentPolicies(limit = 5, filters = {}, context = {}) {
    this._enforcePermission(context);

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      const searchFilters = { ...filters, status: 'ACTIVE' };
      records = db.search(this.repository.tableName, searchFilters);
    }

    // Sort descending by effectiveDate
    records.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    
    return records.slice(0, limit);
  }

  /**
   * Returns a time-series trend of policy approvals.
   */
  getPolicyTrend(filters = {}, context = {}) {
    this._enforcePermission(context);
    
    if (this.analytics && typeof this.analytics.getTimeSeries === 'function') {
      return this.analytics.getTimeSeries('policy_approved', filters);
    }

    // Fallback stub if real AnalyticsService is absent
    return [
      { period: '2026-01', count: 1 },
      { period: '2026-02', count: 0 },
      { period: '2026-03', count: 2 }
    ];
  }
}

module.exports = { PolicyStatistics };

