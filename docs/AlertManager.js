/**
 * @class AlertManager
 * @description Manages and displays system-wide alerts.
 */
class AlertManager {
  /**
   * @param {NotificationRepository} notificationRepository - From the Notification package.
   */
  constructor(notificationRepository) {
    /** @private */
    this.notificationRepository = notificationRepository;
  }

  /**
   * Retrieves all critical system alerts.
   * @param {object} [options={}] - Options for filtering and pagination.
   * @returns {object[]} An array of alert notification objects.
   */
  getAlerts(options = {}) {
    WK.security().checkPermission('operations.alerts.view');
    if (!this.notificationRepository) {
      return [{ error: 'NotificationRepository not available.' }];
    }

    const query = { type: 'SECURITY_ALERT', priority: 'CRITICAL' };
    return this.notificationRepository.findAll(query, { limit: 50, sortBy: 'createdAt', order: 'desc' });
  }
}