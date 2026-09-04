/**
 * @class MonitoringService
 * @description The main service facade for the Monitoring Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class MonitoringService {
  /**
   * @param {MonitoringStatistics} monitoringStatistics
   * @param {HealthCheckService} healthCheckService
   * @param {AlertManager} alertManager
   */
  constructor(monitoringStatistics, healthCheckService, alertManager) {
    /** @private */
    this.monitoringStatistics = monitoringStatistics;
    /** @private */
    this.healthCheckService = healthCheckService;
    /** @private */
    this.alertManager = alertManager;
  }

  /**
   * The main entry point for the monitoring trigger.
   * Collects all metrics and checks for alerts.
   */
  runMonitoringCycle() {
    WK.logger().info('Running monitoring cycle...');
    const metrics = this.collectAllMetrics();
    this.alertManager.checkForAlerts(metrics);
    WK.logger().info('Monitoring cycle complete.');
  }

  /**
   * Collects all key metrics from across the system.
   * @returns {object} An object containing all collected metrics.
   */
  collectAllMetrics() {
    WK.security().checkPermission('monitoringcenter.metrics.collect');
    const metrics = {
      cpu: this.monitoringStatistics.getCpuUsage(),
      memory: this.monitoringStatistics.getMemoryUsage(),
      packageStatus: this.healthCheckService.checkAllPackages(),
      domainStatus: this.healthCheckService.checkAllDomains(),
      workflowStatus: this.monitoringStatistics.getWorkflowStatus(),
      eventQueueSize: this.monitoringStatistics.getEventQueueSize(),
      notificationQueueSize: this.monitoringStatistics.getNotificationQueueSize(),
      analyticsStatus: this.monitoringStatistics.getAnalyticsStatus(),
      databaseStatus: this.monitoringStatistics.getDatabaseStatus(),
      backupStatus: this.monitoringStatistics.getBackupStatus(),
      timestamp: new Date().toISOString()
    };

    // Cache the latest metrics for dashboard use
    this.monitoringStatistics.cacheLatestMetrics(metrics);

    return metrics;
  }
}