/**
 * @class LogViewer
 * @description Provides an interface to view and filter system logs.
 */
class LogViewer {
  /**
   * @param {AuditLogService} auditLogService - From the Governance package.
   */
  constructor(auditLogService) {
    /** @private */
    this.auditLogService = auditLogService;
  }

  /**
   * Retrieves the most recent logs.
   * @param {object} [options={}] - Options for filtering and pagination.
   * @param {number} [options.limit=100] - The number of log entries to retrieve.
   * @returns {object[]} An array of log entry objects.
   */
  getRecentLogs(options = {}) {
    WK.security().checkPermission('operations.logs.view');
    if (!this.auditLogService) {
      return [{ error: 'AuditLogService not available.' }];
    }

    const { limit = 100 } = options;
    return this.auditLogService.getLogs({}, { limit: limit });
  }
}