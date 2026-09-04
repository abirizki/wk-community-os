/**
 * @class PosyanduStatistics
 * @description Provides aggregated statistical data for the Posyandu package.
 */
class PosyanduStatistics {
  /**
   * @param {PosyanduRepository} posyanduRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(posyanduRepository, analyticsService) {
    /** @private */
    this.repository = posyanduRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('posyandu_stats');
    /** @private */
    this.logger = WK.logger('PosyanduStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of Posyandu activities.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    const summary = {
      totalVisits: this.repository.count(filters),
      uniqueCitizensServed: this.analyticsService.getUniqueCount({ metric: 'posyandu_visit_created', dimension: 'citizenId', filters }),
      visitsThisMonth: this.repository.count({ ...filters, visitDate: { gte: startOfMonth } }),
      followUpRequired: this.repository.count({ ...filters, developmentStatus: 'NEEDS_MONITORING' }),
      referralRequired: this.repository.count({ ...filters, developmentStatus: 'DELAYED' }), // Assuming 'DELAYED' implies referral
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of Posyandu visits.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getMonthlyVisitTrend(filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    return this.analyticsService.getTimeSeries({
      metric: 'posyandu_visit_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of nutrition statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getNutritionDistribution(filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    // This simulates a GROUP BY query.
    const statuses = ['GOOD', 'UNDERWEIGHT', 'OVERWEIGHT', 'SEVERELY_UNDERWEIGHT', 'OBESITY'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, nutritionStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of development statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getDevelopmentDistribution(filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    const statuses = ['NORMAL', 'NEEDS_MONITORING', 'DELAYED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, developmentStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the coverage rate for a specific vitamin.
   * @param {string} vitaminCode - The code for the vitamin (e.g., 'VITAMIN_A').
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with { name, value } representing the percentage.
   */
  getVitaminCoverage(vitaminCode, filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    const totalVisits = this.repository.count(filters);
    if (totalVisits === 0) {
      return { name: vitaminCode, value: 0 };
    }
    // This requires a query that can check for an element within a JSON array.
    // The analytics service is assumed to support this.
    const givenCount = this.analyticsService.getCount({
      metric: 'posyandu_vitamin_recorded',
      filters: { ...filters, vitamin: vitaminCode },
    });
    const coverage = (givenCount / totalVisits) * 100;
    return { name: vitaminCode, value: Math.round(coverage) };
  }

  /**
   * Calculates the distribution of immunization statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getImmunizationDistribution(filters = {}) {
    WK.security().checkPermission('posyandu.dashboard.view');
    const statuses = ['COMPLETE', 'INCOMPLETE', 'DUE', 'FOLLOW_UP_REQUIRED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, immunizationStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }
}