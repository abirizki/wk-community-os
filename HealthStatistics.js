/**
 * @class HealthStatistics
 * @description Provides aggregated statistical data for the Health package.
 */
class HealthStatistics {
  /**
   * @param {HealthRepository} healthRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(healthRepository, analyticsService) {
    /** @private */
    this.repository = healthRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('health_stats');
    /** @private */
    this.logger = WK.logger('HealthStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level overview of health statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getOverview(filters = {}) {
    WK.security().checkPermission('health.dashboard.view');
    const cacheKey = `overview_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached overview data for key: ${cacheKey}`);
      return cachedData;
    }

    const overview = {
      totalProfiles: this.repository.count(filters),
      statusDistribution: this.getHealthStatusDistribution(filters),
      bloodTypeDistribution: this.getBloodTypeDistribution(filters),
    };

    this.cache.set(cacheKey, overview, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new overview data for key: ${cacheKey}`);
    return overview;
  }

  /**
   * Calculates the distribution of health statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getHealthStatusDistribution(filters = {}) {
    WK.security().checkPermission('health.dashboard.view');
    // This would ideally use a GROUP BY aggregation query if the DB adapter supports it.
    // Simulating for now, which is less performant but works with a basic adapter.
    const statuses = ['HEALTHY', 'OBSERVATION', 'TREATMENT', 'RECOVERED', 'CRITICAL', 'UNKNOWN'];
    const distribution = statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, healthStatus: status })
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of blood types.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getBloodTypeDistribution(filters = {}) {
     WK.security().checkPermission('health.dashboard.view');
     const bloodTypes = ['A', 'B', 'AB', 'O'];
     const distribution = bloodTypes.map(type => ({
         name: type,
         value: this.repository.count({ ...filters, bloodType: type })
     }));
     return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves the monthly trend of new health profile registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getMonthlyRegistrationTrend(filters = {}) {
      WK.security().checkPermission('health.dashboard.view');
      // This query is delegated to the Analytics Engine, which is optimized for time-series data.
      return this.analyticsService.getTimeSeries({
          metric: 'health_profile_created',
          aggregation: 'count',
          period: 'monthly',
          dateRange: filters.dateRange || 'last_12_months',
          filters: filters
      });
  }

  /**
   * Retrieves the most frequently reported diseases.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of top diseases to return.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTopDiseases(filters = {}, limit = 5) {
      WK.security().checkPermission('health.dashboard.view');
      // This is a complex query that would require full-text search or a proper analytics engine.
      // The Analytics Service is assumed to handle this kind of aggregation efficiently.
      return this.analyticsService.getTopN({
          metric: 'health_profile_disease_reported',
          dimension: 'diseaseName',
          limit: limit,
          filters: filters
      });
  }

  /**
   * Retrieves the most frequently reported allergies.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of top allergies to return.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTopAllergies(filters = {}, limit = 5) {
      WK.security().checkPermission('health.dashboard.view');
      return this.analyticsService.getTopN({
          metric: 'health_profile_allergy_reported',
          dimension: 'allergyName',
          limit: limit,
          filters: filters
      });
  }
}