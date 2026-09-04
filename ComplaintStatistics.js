/**
 * @class ComplaintStatistics
 * @description Provides aggregated statistical data for the Complaint package.
 */
class ComplaintStatistics {
  /**
   * @param {ComplaintRepository} repository
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('complaint_stats');
    /** @private */
    this.logger = WK.logger('ComplaintStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes for operational complaint data
  }

  /**
   * Retrieves a high-level summary of complaint statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('complaint.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalComplaints: this.repository.count({ ...filters }),
      openComplaints: this.repository.count({ ...filters, status: { in: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'REOPENED'] } }),
      resolvedComplaints: this.repository.count({ ...filters, status: 'RESOLVED' }),
      closedComplaints: this.repository.count({ ...filters, status: 'CLOSED' }),
      rejectedComplaints: this.repository.count({ ...filters, status: 'REJECTED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new complaint submissions.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getCreatedTrend(filters = {}) {
    WK.security().checkPermission('complaint.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'complaint_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of complaints by category.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getCategoryDistribution(filters = {}) {
    WK.security().checkPermission('complaint.statistics.view');
    // From ComplaintSeeder.js
    const categories = ['INFRASTRUCTURE', 'PUBLIC_SERVICE', 'ENVIRONMENT', 'SOCIAL', 'OTHER'];
    const distribution = categories.map(category => ({
      name: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, category: category }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of complaints by their current status.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('complaint.statistics.view');
    // From ComplaintSeeder.js
    const statuses = ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'RESOLVED', 'REJECTED', 'CLOSED', 'CANCELLED', 'REOPENED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, status: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the average resolution time for resolved complaints.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with average time in days/hours.
   */
  getAverageResolutionTime(filters = {}) {
    WK.security().checkPermission('complaint.statistics.view');
    // This complex calculation is delegated to the AnalyticsService.
    // It would measure the time from submissionDate to resolutionDate.
    return this.analyticsService.getAverage({
      metric: 'complaint_resolution_time',
      unit: 'days',
      filters: { ...filters, status: 'RESOLVED' },
    });
  }
}