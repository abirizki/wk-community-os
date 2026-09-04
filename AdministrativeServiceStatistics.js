/**
 * @class AdministrativeServiceStatistics
 * @description Provides aggregated statistical data for the AdministrativeService package.
 */
class AdministrativeServiceStatistics {
  /**
   * @param {AdministrativeServiceRepository} repository
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('admin_service_stats');
    /** @private */
    this.logger = WK.logger('AdministrativeServiceStatistics');
    /** @private */
    this.defaultCacheTTL = 600; // 10 minutes for workflow data
  }

  /**
   * Retrieves a high-level summary of service request statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('administrativeservice.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalRequests: this.repository.count({ ...filters }),
      pendingRequests: this.repository.count({ ...filters, requestStatus: { in: ['SUBMITTED', 'RT_VERIFIED', 'RW_VERIFIED'] } }),
      completedRequests: this.repository.count({ ...filters, requestStatus: 'COMPLETED' }),
      rejectedRequests: this.repository.count({ ...filters, requestStatus: 'REJECTED' }),
      draftRequests: this.repository.count({ ...filters, requestStatus: 'DRAFT' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new service request submissions.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getSubmissionTrend(filters = {}) {
    WK.security().checkPermission('administrativeservice.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'admin_service_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of requests by type.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getRequestTypeDistribution(filters = {}) {
    WK.security().checkPermission('administrativeservice.statistics.view');
    // From AdministrativeServiceSeeder.js
    const types = ['SURAT_PENGANTAR', 'SKTM'];
    const distribution = types.map(type => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, requestType: type }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of requests by their current status.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('administrativeservice.statistics.view');
    // From AdministrativeServiceSeeder.js
    const statuses = ['DRAFT', 'SUBMITTED', 'RT_VERIFIED', 'RW_VERIFIED', 'KELURAHAN_PROCESSED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, requestStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the average processing time for completed requests.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with average time in days/hours.
   */
  getAverageProcessingTime(filters = {}) {
    WK.security().checkPermission('administrativeservice.statistics.view');
    // This complex calculation is delegated to the AnalyticsService.
    return this.analyticsService.getAverage({
      metric: 'admin_service_processing_time', // Assumes a metric tracking time from submissionDate to completedAt
      unit: 'days',
      filters: { ...filters, requestStatus: 'COMPLETED' },
    });
  }
}