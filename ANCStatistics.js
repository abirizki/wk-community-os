/**
 * @class ANCStatistics
 * @description Provides aggregated statistical data for the ANC (Antenatal Care) package.
 */
class ANCStatistics {
  /**
   * @param {ANCRepository} ancRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(ancRepository, analyticsService) {
    /** @private */
    this.repository = ancRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('anc_stats');
    /** @private */
    this.logger = WK.logger('ANCStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of ANC statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('anc.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      totalAncVisits: this.repository.count(filters),
      pregnanciesMonitored: this.analyticsService.getUniqueCount({ metric: 'anc_visit_created', dimension: 'pregnancyId', filters }),
      highRiskRecords: this.repository.count({ ...filters, riskStatus: 'HIGH_RISK' }),
      monitoringRecords: this.repository.count({ ...filters, riskStatus: 'MONITORING' }),
      followUpRequired: this.repository.count({ ...filters, followUpRequired: true }),
      referralRequired: this.repository.count({ ...filters, referralRequired: true }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new ANC visit registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getTrend(filters = {}) {
    WK.security().checkPermission('anc.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'anc_visit_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of ANC risk statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getRiskStatistics(filters = {}) {
    WK.security().checkPermission('anc.statistics.view');
    const statuses = ['NORMAL', 'MONITORING', 'HIGH_RISK', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, riskStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of follow-up requirements.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getFollowUpStatistics(filters = {}) {
    WK.security().checkPermission('anc.statistics.view');
    const distribution = [
      { name: 'Required', value: this.repository.count({ ...filters, followUpRequired: true }) },
      { name: 'Not Required', value: this.repository.count({ ...filters, followUpRequired: false }) },
    ];
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of referral requirements.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getReferralStatistics(filters = {}) {
    WK.security().checkPermission('anc.statistics.view');
    const distribution = [
      { name: 'Required', value: this.repository.count({ ...filters, referralRequired: true }) },
      { name: 'Not Required', value: this.repository.count({ ...filters, referralRequired: false }) },
    ];
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves recently created ANC records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {ANCRecord[]} An array of ANC entities.
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('anc.dashboard.view');
    return this.repository.list({
      ...filters,
      limit: limit,
      sortBy: 'createdAt',
      order: 'desc',
    });
  }
}