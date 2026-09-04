/**
 * @class ReferralStatistics
 * @description Provides aggregated statistical data for the Referral package.
 */
class ReferralStatistics {
  /**
   * @param {ReferralRepository} referralRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(referralRepository, analyticsService) {
    /** @private */
    this.repository = referralRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('referral_stats');
    /** @private */
    this.logger = WK.logger('ReferralStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of referral statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      total: this.repository.count(filters),
      pending: this.repository.count({ ...filters, referralStatus: 'PENDING' }),
      active: this.repository.count({ ...filters, referralStatus: { in: ['ACCEPTED', 'IN_PROGRESS'] } }),
      completed: this.repository.count({ ...filters, referralStatus: 'COMPLETED' }),
      rejected: this.repository.count({ ...filters, referralStatus: 'REJECTED' }),
      cancelled: this.repository.count({ ...filters, referralStatus: 'CANCELLED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new referrals.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getTrend(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'referral_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of referral statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    const statuses = ['DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, referralStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of referral types.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTypeDistribution(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    const types = ['INTERNAL', 'EXTERNAL', 'EMERGENCY', 'SPECIALIST', 'FOLLOW_UP', 'DIAGNOSTIC', 'OTHER'];
    const distribution = types.map(type => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, referralType: type }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of referral priorities.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getPriorityDistribution(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    const priorities = ['NORMAL', 'URGENT', 'EMERGENCY'];
    const distribution = priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, priority: priority }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves an overview of follow-up statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing follow-up statistics.
   */
  getFollowUpOverview(filters = {}) {
    WK.security().checkPermission('referral.statistics.view');
    const today = new Date().toISOString().split('T')[0];

    const overview = {
      upcoming: this.repository.count({
        ...filters,
        followUpDate: { gte: today },
        followUpStatus: 'SCHEDULED',
      }),
      overdue: this.repository.count({
        ...filters,
        followUpDate: { lt: today },
        followUpStatus: { in: ['PENDING', 'SCHEDULED'] },
      }),
      completed: this.repository.count({ ...filters, followUpStatus: 'COMPLETED' }),
    };

    return overview;
  }
}