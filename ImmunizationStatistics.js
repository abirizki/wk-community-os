/**
 * @class ImmunizationStatistics
 * @description Provides aggregated statistical data for the Immunization package.
 */
class ImmunizationStatistics {
  /**
   * @param {ImmunizationRepository} immunizationRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(immunizationRepository, analyticsService) {
    /** @private */
    this.repository = immunizationRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('immunization_stats');
    /** @private */
    this.logger = WK.logger('ImmunizationStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of immunization statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('immunization.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const today = new Date().toISOString().split('T')[0];

    const summary = {
      totalRecords: this.repository.count(filters),
      administered: this.repository.count({ ...filters, administrationStatus: 'ADMINISTERED' }),
      scheduled: this.repository.count({ ...filters, administrationStatus: 'SCHEDULED' }),
      missed: this.repository.count({ ...filters, administrationStatus: 'MISSED' }),
      upcoming: this.repository.count({ ...filters, nextDoseDate: { gte: today } }),
      uniqueCitizens: this.analyticsService.getUniqueCount({ metric: 'immunization_administered', dimension: 'citizenId', filters }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of immunizations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getTrend(filters = {}) {
    WK.security().checkPermission('immunization.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'immunization_administered',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: { ...filters, administrationStatus: 'ADMINISTERED' },
    });
  }

  /**
   * Calculates the distribution of immunization administration statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('immunization.statistics.view');
    const statuses = ['SCHEDULED', 'ADMINISTERED', 'CANCELLED', 'MISSED', 'DEFERRED', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, administrationStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of administered vaccines.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getVaccineDistribution(filters = {}) {
    WK.security().checkPermission('immunization.statistics.view');
    // This would ideally use a GROUP BY aggregation query.
    // The analytics service is assumed to handle this.
    return this.analyticsService.getTopN({
      metric: 'immunization_administered',
      dimension: 'vaccineName',
      limit: 10,
      filters: { ...filters, administrationStatus: 'ADMINISTERED' },
    });
  }

  /**
   * Retrieves recently administered immunization records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {ImmunizationRecord[]} An array of immunization entities.
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('immunization.dashboard.view');
    return this.repository.search(
      { ...filters, administrationStatus: 'ADMINISTERED' },
      { limit, sortBy: 'administrationDate', order: 'desc' }
    );
  }
}