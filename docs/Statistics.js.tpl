/**
 * @class <<statisticsName>>
 * @description Provides statistical data for the <<packageName>> Dashboard.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<statisticsName>> {
  /**
   * @param {AnalyticsService} analyticsService
   */
  constructor(analyticsService) {
    /** @private */
    this.analyticsService = analyticsService;
  }

  /**
   * Fetches the total count of <<packageName>> entities.
   * @returns {number}
   */
  getTotalCount() {
    WK.security().checkPermission('<<permissionPrefix>>.view');
    // This assumes the Analytics package has been configured to aggregate this metric.
    const metricName = '<<packageLowercase>>.total.count';
    WK.logger().debug(`Fetching dashboard data for metric: ${metricName}`);
    return this.analyticsService.getDashboardData(metricName);
  }

  // [TODO: Add other methods to fetch statistics for dashboard widgets]
}