/**
 * @class HealthVisitStatistics
 * @description Provides aggregated statistical data for the HealthVisit package.
 */
class HealthVisitStatistics {
  /**
   * @param {HealthVisitRepository} healthVisitRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(healthVisitRepository, analyticsService) {
    /** @private */
    this.repository = healthVisitRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('healthvisit_stats');
    /** @private */
    this.logger = WK.logger('HealthVisitStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of health visit statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('healthvisit.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      totalVisits: this.repository.count(filters),
      completedVisits: this.repository.count({ ...filters, visitStatus: 'COMPLETED' }),
      scheduledVisits: this.repository.count({ ...filters, visitStatus: 'SCHEDULED' }),
      missedOrCancelled: this.repository.count({ ...filters, visitStatus: { in: ['CANCELLED', 'NO_SHOW'] } }),
      uniqueCitizens: this.analyticsService.getUniqueCount({ metric: 'health_visit_created', dimension: 'citizenId', filters }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new health visits.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getTrend(filters = {}) {
    WK.security().checkPermission('healthvisit.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'health_visit_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of health visit statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('healthvisit.statistics.view');
    const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, visitStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of health visit types.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTypeDistribution(filters = {}) {
    WK.security().checkPermission('healthvisit.statistics.view');
    const types = ['GENERAL', 'POSYANDU', 'FOLLOW_UP', 'REFERRAL', 'COMMUNITY', 'HOME_VISIT', 'OTHER'];
    const distribution = types.map(type => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, visitType: type }),
    }));
    return distribution.filter(d => d.value > 0);
  }
}