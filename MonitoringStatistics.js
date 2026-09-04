/**
 * @class MonitoringStatistics
 * @description Provides the data sources for the monitoring dashboard widgets.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class MonitoringStatistics {
  /**
   * @param {Kernel} kernel - The core Kernel service
   * @param {EventBus} eventBus
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   * @param {AnalyticsService} analyticsService
   * @param {DeploymentService} deploymentService
   */
  constructor(kernel, eventBus, notificationService, workflowService, analyticsService, deploymentService) {
    /** @private */
    this.kernel = kernel;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.deploymentService = deploymentService;
    /** @private */
    this.cache = WK.service('CacheService'); // Assuming a core caching service
  }

  /**
   * Caches the latest collected metrics.
   * @param {object} metrics - The metrics object from MonitoringService.
   */
  cacheLatestMetrics(metrics) {
    this.cache.set('monitoring_latest_metrics', metrics, 360); // Cache for 6 minutes
  }

  /**
   * Retrieves the latest cached metrics.
   * @returns {object}
   */
  getLatestMetrics() {
    return this.cache.get('monitoring_latest_metrics') || {};
  }

  getOverallSystemStatus() {
    const metrics = this.getLatestMetrics();
    // Logic to determine overall status based on all metrics
    return 'OPERATIONAL'; // Placeholder
  }

  getCpuUsage() {
    // This is conceptual for Apps Script, as direct CPU access isn't available.
    // It might represent average execution time or a similar proxy metric.
    return Math.floor(Math.random() * 100); // Placeholder
  }

  getMemoryUsage() {
    // Conceptual placeholder
    return Math.floor(Math.random() * 100);
  }

  getEventQueueSize() {
    return this.eventBus.getQueueSize();
  }

  getNotificationQueueSize() {
    return this.notificationService.getQueueSize();
  }

  getWorkflowStatus() {
    return { failedCount: this.workflowService.getFailedWorkflowCount() };
  }

  getAnalyticsStatus() {
    return { lastRun: this.analyticsService.getLastRunTimestamp() };
  }

  getDatabaseStatus() {
    return { status: 'OPERATIONAL' }; // Placeholder
  }

  getBackupStatus() {
    return this.deploymentService.getLastBackupStatus();
  }
}