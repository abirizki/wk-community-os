/**
 * @class PregnancyStatistics
 * @description Provides aggregated statistical data for the Pregnancy package.
 */
class PregnancyStatistics {
  /**
   * @param {PregnancyRepository} pregnancyRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(pregnancyRepository, analyticsService) {
    /** @private */
    this.repository = pregnancyRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('pregnancy_stats');
    /** @private */
    this.logger = WK.logger('PregnancyStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of pregnancy statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      totalPregnancies: this.repository.count(filters),
      activePregnancies: this.repository.count({ ...filters, status: 'ACTIVE' }),
      completedPregnancies: this.repository.count({ ...filters, status: 'COMPLETED' }),
      highRiskPregnancies: this.repository.count({ ...filters, riskStatus: 'HIGH_RISK' }),
      monitoringPregnancies: this.repository.count({ ...filters, riskStatus: 'MONITORING' }),
      followUpRequired: this.repository.count({ ...filters, riskStatus: { in: ['HIGH_RISK', 'MONITORING'] } }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new pregnancy registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getTrend(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'pregnancy_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of pregnancy statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusStatistics(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    const statuses = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ENDED', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, status: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of pregnancy outcomes.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getOutcomeStatistics(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    const outcomes = ['LIVE_BIRTH', 'STILLBIRTH', 'MISCARRIAGE', 'TERMINATION', 'UNKNOWN'];
    const distribution = outcomes.map(outcome => ({
      name: outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, pregnancyOutcome: outcome }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of pregnancy risk statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getRiskStatistics(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    const statuses = ['NORMAL', 'MONITORING', 'HIGH_RISK', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, riskStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of pregnancy numbers (1st, 2nd, 3rd, etc.).
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getPregnancyNumberStatistics(filters = {}) {
    WK.security().checkPermission('pregnancy.statistics.view');
    // This is a simplified distribution. A real implementation might use a GROUP BY query.
    const distribution = [
      { name: '1st Pregnancy', value: this.repository.count({ ...filters, pregnancyNumber: 1 }) },
      { name: '2nd Pregnancy', value: this.repository.count({ ...filters, pregnancyNumber: 2 }) },
      { name: '3rd Pregnancy', value: this.repository.count({ ...filters, pregnancyNumber: 3 }) },
      { name: '4th+ Pregnancy', value: this.repository.count({ ...filters, pregnancyNumber: { gt: 3 } }) },
    ];
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves recently created pregnancy records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {Pregnancy[]} An array of pregnancy entities.
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('pregnancy.dashboard.view');
    return this.repository.list({
      ...filters,
      limit: limit,
      sortBy: 'createdAt',
      order: 'desc',
    });
  }
}