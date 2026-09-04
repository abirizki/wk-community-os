/**
 * Records platform audit events.
 * @class
 */
class AuditService {
  /**
   * Creates an audit service.
   * @param {LoggerService} loggerService - Logger service.
   * @param {StorageService} storageService - Storage service.
   */
  constructor(loggerService, storageService) {
    this.logger = loggerService || new LoggerService();
    this.storage = storageService || new StorageService();
    this.entries = [];
  }

  /**
   * Records an audit entry.
   * @param {string} action - Action name.
   * @param {Object} context - Context object.
   */
  record(action, context) {
    const entry = { action, context, timestamp: new Date().toISOString() };
    this.entries.push(entry);
    this.storage.set(`audit:${this.entries.length}`, entry);
    this.logger.info(`Audit recorded: ${action}`, context);
  }

  /**
   * Returns recent audit entries.
   * @param {number} count - Entry count.
   * @returns {Array} Audit entries.
   */
  getRecent(count) {
    return this.entries.slice(-count);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AuditService
  };
}
