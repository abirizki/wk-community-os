/**
 * @class QueueMonitor
 * @description Provides visibility into the status of system queues.
 */
class QueueMonitor {
  /**
   * @param {EventBusService} eventBusService
   * @param {NotificationService} notificationService
   */
  constructor(eventBusService, notificationService) {
    /** @private */
    this.eventBusService = eventBusService;
    /** @private */
    this.notificationService = notificationService;
  }

  /**
   * Gets the status of all monitored queues.
   * @returns {object[]} An array of queue status objects.
   */
  getAllQueueStatuses() {
    WK.security().checkPermission('operations.queues.view');
    const statuses = [];

    // Get EventBus Queue Status
    if (this.eventBusService && this.eventBusService.queue) {
      statuses.push({
        name: 'EventBus Queue',
        pending: this.eventBusService.queue.getPendingCount(),
        failed: this.eventBusService.queue.getFailedCount(),
        lastProcessed: this.eventBusService.queue.getLastProcessedTimestamp()
      });
    } else {
      statuses.push({ name: 'EventBus Queue', error: 'Service not available.' });
    }

    // Get Notification Queue Status
    if (this.notificationService && this.notificationService.queue) {
      statuses.push({
        name: 'Notification Queue',
        pending: this.notificationService.queue.getPendingCount(),
        failed: this.notificationService.queue.getFailedCount(),
        lastProcessed: this.notificationService.queue.getLastProcessedTimestamp()
      });
    } else {
      statuses.push({ name: 'Notification Queue', error: 'Service not available.' });
    }

    return statuses;
  }
}