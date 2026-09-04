/**
 * @class LetterStatistics
 * @description Provides aggregated statistical data for the Letter package.
 */
class LetterStatistics {
  /**
   * @param {LetterRepository} repository
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('letter_stats');
    /** @private */
    this.logger = WK.logger('LetterStatistics');
    /** @private */
    this.defaultCacheTTL = 600; // 10 minutes for letter workflow data
  }

  /**
   * Retrieves a high-level summary of letter statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('letter.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalLetters: this.repository.count({ ...filters }),
      issuedLetters: this.repository.count({ ...filters, letterStatus: 'ISSUED' }),
      pendingSignature: this.repository.count({ ...filters, letterStatus: 'PENDING_SIGNATURE' }),
      revokedLetters: this.repository.count({ ...filters, letterStatus: 'REVOKED' }),
      expiredLetters: this.repository.count({ ...filters, letterStatus: 'EXPIRED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new letter issuances.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getIssuanceTrend(filters = {}) {
    WK.security().checkPermission('letter.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'letter_issued',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of letters by type.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getLetterTypeDistribution(filters = {}) {
    WK.security().checkPermission('letter.statistics.view');
    // From LetterSeeder.js
    const types = ['SURAT_PENGANTAR', 'SKTM'];
    const distribution = types.map(type => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, letterType: type }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of letters by their current status.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('letter.statistics.view');
    // From LetterSeeder.js
    const statuses = ['DRAFT', 'PENDING_SIGNATURE', 'ISSUED', 'EXPIRED', 'REVOKED', 'REJECTED', 'CANCELLED'];
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, letterStatus: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the average fulfillment time for issued letters.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with average time in days/hours.
   */
  getAverageFulfillmentTime(filters = {}) {
    WK.security().checkPermission('letter.statistics.view');
    // This complex calculation is delegated to the AnalyticsService.
    // It would measure the time from AdministrativeService request creation to Letter issuance.
    return this.analyticsService.getAverage({
      metric: 'letter_fulfillment_time',
      unit: 'hours',
      filters: { ...filters, letterStatus: 'ISSUED' },
    });
  }
}