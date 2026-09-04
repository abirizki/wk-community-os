/**
 * @class IntegrationStatistics
 * @description Provides statistical data for the Integration Hub Dashboard.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationStatistics {
  /**
   * @param {AnalyticsService} analyticsService
   */
  constructor(analyticsService) {
    /** @private */
    this.analyticsService = analyticsService;
  }

  /**
   * Fetches the total number of API calls made in the last 24 hours.
   * @returns {number}
   */
  getTotalApiCalls24h() {
    WK.security().checkPermission('integrationhub.dashboard.view');
    const metricName = 'integrationhub.api_calls.24h';
    return this.analyticsService.getDashboardData(metricName) || 0;
  }

  /**
   * Fetches the number of failed webhooks received in the last 24 hours.
   * @returns {number}
   */
  getFailedWebhooks24h() {
    WK.security().checkPermission('integrationhub.dashboard.view');
    const metricName = 'integrationhub.webhooks.failed.24h';
    return this.analyticsService.getDashboardData(metricName) || 0;
  }

  /**
   * Fetches the number of emails sent in the last 24 hours.
   * @returns {number}
   */
  getEmailsSent24h() {
    WK.security().checkPermission('integrationhub.dashboard.view');
    const metricName = 'integrationhub.email.sent.24h';
    return this.analyticsService.getDashboardData(metricName) || 0;
  }
}