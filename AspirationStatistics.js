/**
 * @class AspirationStatistics
 * @description Provides aggregated statistical data for the Aspiration package.
 */
class AspirationStatistics {
  /**
   * @param {AspirationRepository} repository
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('aspiration_stats');
    /** @private */
    this.logger = WK.logger('AspirationStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes for operational aspiration data
  }

  /**
   * Retrieves a high-level summary of aspiration statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalAspirations: this.repository.count({ ...filters }),
      submittedAspirations: this.repository.count({ ...filters, status: 'SUBMITTED' }),
      inReviewAspirations: this.repository.count({ ...filters, status: { in: ['IN_REVIEW', 'ASSIGNED'] } }),
      implementedAspirations: this.repository.count({ ...filters, status: 'IMPLEMENTED' }),
      rejectedAspirations: this.repository.count({ ...filters, status: 'REJECTED' }),
      archivedAspirations: this.repository.count({ ...filters, status: 'ARCHIVED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new aspiration submissions.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getSubmissionTrend(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'aspiration_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of aspirations by category.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getCategoryDistribution(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    // From AspirationSeeder.js
    const categories = ['INFRASTRUCTURE', 'PUBLIC_SERVICE', 'ENVIRONMENT', 'EDUCATION', 'SOCIAL', 'ECONOMY', 'OTHER'];
    const distribution = categories.map(category => ({
      name: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, category: category }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of aspirations by their current status.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    // From AspirationSeeder.js / AspirationRule.js
    const statuses = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ASSIGNED', 'IMPLEMENTED', 'ARCHIVED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, status: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves aggregated voting statistics for aspirations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing voting aggregate metrics.
   */
  getVotingSummary(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    const cacheKey = `voting_summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const votingSummary = {
      totalUpvotes: this.analyticsService.getSum({
        metric: 'aspiration_upvotes',
        field: 'upvotes',
        filters: filters,
      }),
      totalDownvotes: this.analyticsService.getSum({
        metric: 'aspiration_downvotes',
        field: 'downvotes',
        filters: filters,
      }),
    };

    this.cache.set(cacheKey, votingSummary, this.defaultCacheTTL);
    return votingSummary;
  }

  /**
   * Calculates the average resolution time for implemented aspirations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with average time in days/hours.
   */
  getAverageResolutionTime(filters = {}) {
    WK.security().checkPermission('aspiration.statistics.view');
    // This complex calculation is delegated to the AnalyticsService.
    // It would measure the time from submissionDate to resolutionDate.
    return this.analyticsService.getAverage({
      metric: 'aspiration_resolution_time',
      unit: 'days',
      filters: { ...filters, status: 'IMPLEMENTED' },
    });
  }
}

