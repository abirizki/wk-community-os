/**
 * @class AlertManager
 * @description Manages the logic for triggering alerts when monitoring thresholds are breached.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class AlertManager {
  /**
   * @param {ConfigurationService} configurationService
   * @param {NotificationService} notificationService
   */
  constructor(configurationService, notificationService) {
    /** @private */
    this.configurationService = configurationService;
    /** @private */
    this.notificationService = notificationService;
  }

  /**
   * Checks a set of metrics against configured thresholds and triggers alerts.
   * @param {object} metrics - The collected metrics from MonitoringService.
   */
  checkForAlerts(metrics) {
    const thresholds = this.configurationService.get('monitoring.thresholds');
    if (!thresholds) {
      WK.logger().warn('Monitoring thresholds not configured. Skipping alert checks.');
      return;
    }

    // Check Event Queue Size
    if (metrics.eventQueueSize > thresholds.event_queue_critical) {
      this.triggerAlert('CRITICAL: Event Queue', `EventBus queue size is ${metrics.eventQueueSize}, exceeding critical threshold of ${thresholds.event_queue_critical}.`);
    }

    // [TODO: Add checks for all other metrics like CPU, memory, failed workflows, etc.]
  }

  /**
   * Triggers a system alert.
   * @param {string} title - The title of the alert.
   * @param {string} body - The body/details of the alert.
   */
  triggerAlert(title, body) {
    WK.logger().error(`ALERT TRIGGERED: ${title} - ${body}`);
    this.notificationService.sendToRole('SystemAdministrator', {
      channel: 'EMAIL', // Send critical alerts via email
      type: 'SYSTEM_ALERT',
      title: title,
      body: body
    });
  }
}