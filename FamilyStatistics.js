/**
 * @class FamilyStatistics
 * @description Provides aggregated statistical data for the Family package.
 */
class FamilyStatistics {
  /**
   * @param {FamilyRepository} familyRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(familyRepository, analyticsService) {
    /** @private */
    this.repository = familyRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('family_stats');
    /** @private */
    this.logger = WK.logger('FamilyStatistics');
    /** @private */
    this.defaultCacheTTL = 3600; // 1 hour
  }

  /**
   * Retrieves a high-level summary of family statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('family.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalFamilies: this.repository.count({ ...filters }),
      activeFamilies: this.repository.count({ ...filters, status: 'ACTIVE' }),
      inactiveFamilies: this.repository.count({ ...filters, status: 'INACTIVE' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new family registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getRegistrationTrend(filters = {}) {
    WK.security().checkPermission('family.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'family_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of family statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('family.statistics.view');
    const statuses = ['ACTIVE', 'INACTIVE', 'MERGED', 'SPLIT'];
    const distribution = statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, status: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of family sizes (number of members).
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getFamilySizeDistribution(filters = {}) {
    WK.security().checkPermission('family.statistics.view');
    // This is a complex query that requires iterating over records or a specialized analytics engine.
    // We delegate this to the AnalyticsService, which is assumed to handle this efficiently.
    return this.analyticsService.getDistribution({
      metric: 'family_member_count',
      filters: filters,
      bins: [
        { name: '1-2 Anggota', range: [1, 2] },
        { name: '3-4 Anggota', range: [3, 4] },
        { name: '5-6 Anggota', range: [5, 6] },
        { name: '7+ Anggota', range: [7, Infinity] },
      ],
    });
  }
}