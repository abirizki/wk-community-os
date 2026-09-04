/**
 * Produces simple report summaries for platform consumers.
 * @class
 */
class ReportService {
  /**
   * Creates a report service.
   * @param {StorageService} storageService - Storage service.
   * @param {LoggerService} loggerService - Logger service.
   * @param {DashboardService} dashboardService - Optional dashboard service.
   */
  constructor(storageService, loggerService, dashboardService) {
    this.storage = storageService || new StorageService();
    this.logger = loggerService || new LoggerService();
    this.dashboardService = dashboardService;
  }

  /**
   * Creates a report summary.
   * @param {string} reportId - Report identifier.
   * @returns {Object} Summary object.
   */
  getSummary(reportId) {
    const record = this.storage.get(reportId, null);
    this.logger.info('Report summary requested', { reportId });
    return { reportId, record };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ReportService
  };
}
