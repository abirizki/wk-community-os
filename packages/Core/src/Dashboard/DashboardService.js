/**
 * Exposes dashboard widget data for platform consumers.
 * @class
 */
class DashboardService {
  /**
   * Creates a dashboard service.
   * @param {ReportService} reportService - Report service.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(reportService, loggerService) {
    this.reportService = reportService;
    this.logger = loggerService || new LoggerService();
  }

  /**
   * Returns a widget summary for the dashboard.
   * @param {string} widgetId - Widget identifier.
   * @returns {Object} Widget payload.
   */
  getWidget(widgetId) {
    this.logger.info('Dashboard widget requested', { widgetId });
    return {
      widgetId,
      summary: this.reportService.getSummary(widgetId)
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DashboardService
  };
}
