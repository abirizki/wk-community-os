/**
 * @class MotherStatistics
 * @description Provides aggregated statistical data for the Mother package.
 */
class MotherStatistics {
  /**
   * @param {MotherRepository} motherRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(motherRepository, analyticsService) {
    /** @private */
    this.repository = motherRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('mother_stats');
    /** @private */
    this.logger = WK.logger('MotherStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of maternal health statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      totalMothers: this.repository.count(filters),
      pregnantMothers: this.repository.count({ ...filters, pregnancyStatus: 'PREGNANT' }),
      highRiskMothers: this.repository.count({ ...filters, maternalRiskStatus: 'HIGH_RISK' }),
      monitoringMothers: this.repository.count({ ...filters, maternalRiskStatus: 'MONITORING' }),
      followUpRequired: this.repository.count({ ...filters, maternalRiskStatus: { in: ['HIGH_RISK', 'MONITORING'] } }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new mother profile registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getMotherRegistrationTrend(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    return this.analyticsService.getTimeSeries({
      metric: 'mother_profile_created',
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
  getPregnancyStatusDistribution(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    const statuses = ['NOT_PREGNANT', 'PREGNANT', 'POSTPARTUM', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, pregnancyStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of maternal risk statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getMaternalRiskDistribution(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    const statuses = ['NORMAL', 'MONITORING', 'HIGH_RISK', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, maternalRiskStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves statistics on pregnancy history.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Aggregated data on pregnancy history.
   */
  getPregnancyHistoryStatistics(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    // This delegates complex aggregation to the Analytics Service.
    return this.analyticsService.getAggregates({
      metrics: [
        { name: 'mother_profile_total_pregnancies', field: 'numberOfPregnancies', type: 'sum' },
        { name: 'mother_profile_avg_pregnancies', field: 'numberOfPregnancies', type: 'avg' },
      ],
      filters: filters,
    });
  }

  /**
   * Retrieves statistics on delivery history.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Aggregated data on delivery history.
   */
  getDeliveryHistoryStatistics(filters = {}) {
    WK.security().checkPermission('mother.dashboard.view');
    return this.analyticsService.getAggregates({
      metrics: [
        { name: 'mother_profile_total_deliveries', field: 'numberOfDeliveries', type: 'sum' },
        { name: 'mother_profile_avg_deliveries', field: 'numberOfDeliveries', type: 'avg' },
      ],
      filters: filters,
    });
  }
}