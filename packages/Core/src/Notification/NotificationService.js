/**
 * Sends notifications through the Core Platform.
 * @class
 */
class NotificationService {
  /**
   * Creates a notification service.
   * @param {LoggerService} loggerService - Logger service.
   * @param {StorageService} storageService - Storage service.
   */
  constructor(loggerService, storageService) {
    this.logger = loggerService || new LoggerService();
    this.storage = storageService || new StorageService();
  }

  /**
   * Sends a notification.
   * @param {string} channel - Channel name.
   * @param {Object} payload - Notification payload.
   * @returns {Object} Notification result.
   */
  send(channel, payload) {
    const event = { channel, payload, timestamp: new Date().toISOString() };
    this.storage.set(`notification:${channel}`, event);
    this.logger.info('Notification sent', { channel, payload });
    return event;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationService
  };
}
