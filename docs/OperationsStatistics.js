/**
 * @class OperationsStatistics
 * @description Acts as the data provider facade for the Operations Dashboard,
 * collecting data from all monitoring services.
 */
class OperationsStatistics {
  /**
   * @param {HealthMonitor} healthMonitor
   * @param {QueueMonitor} queueMonitor
   * @param {SchedulerMonitor} schedulerMonitor
   * @param {SystemMetrics} systemMetrics
   * @param {LogViewer} logViewer
   * @param {AlertManager} alertManager
   */
  constructor(healthMonitor, queueMonitor, schedulerMonitor, systemMetrics, logViewer, alertManager) {
    /** @private */
    this.healthMonitor = healthMonitor;
    /** @private */
    this.queueMonitor = queueMonitor;
    /** @private */
    this.schedulerMonitor = schedulerMonitor;
    /** @private */
    this.systemMetrics = systemMetrics;
    /** @private */
    this.logViewer = logViewer;
    /** @private */
    this.alertManager = alertManager;
  }

  getSystemHealth() {
    return this.healthMonitor.getSystemHealth();
  }

  getQueueStatuses() {
    return this.queueMonitor.getAllQueueStatuses();
  }

  getSchedulerStatuses() {
    return this.schedulerMonitor.getAllSchedulerStatuses();
  }

  getQuotaMetrics() {
    return this.systemMetrics.getQuotaMetrics();
  }

  getRecentLogs() {
    return this.logViewer.getRecentLogs({ limit: 100 });
  }

  getSecurityAlerts() {
    return this.alertManager.getAlerts({ limit: 50 });
  }

  // This is a helper function to be called by triggers to update their status
  static updateSchedulerStatus(triggerName, status, message) {
    const schedulerMonitor = WK.service('operationscenter.schedulerMonitor');
    if (schedulerMonitor) {
      schedulerMonitor.updateStatus(triggerName, status, message);
    }
  }
}