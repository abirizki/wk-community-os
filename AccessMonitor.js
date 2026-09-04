/**
 * @class AccessMonitor
 * @description Logs all critical access events to a secure, immutable log.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class AccessMonitor {
  constructor() {
    /** @private */
    this.logRepository = WK.repository('AccessLogRepository'); // Assumes a dedicated, secure repository
  }

  /**
   * Logs an access event.
   * @param {object} eventData
   * @param {string} eventData.eventType - e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'SESSION_REFRESH'.
   * @param {string} eventData.userId - The ID of the user involved.
   * @param {string} eventData.ipAddress - The source IP address.
   * @param {object} [eventData.details] - Additional event details.
   */
  logEvent(eventData) {
    this.logRepository.create({
      timestamp: new Date().toISOString(),
      ...eventData
    });
  }

  /**
   * Retrieves recent logs for analysis.
   * @param {number} [limit=1000] - The number of recent logs to retrieve.
   * @returns {Array<object>}
   */
  getRecentLogs(limit = 1000) {
    return this.logRepository.findAll({}, { limit: limit, sortBy: 'timestamp', order: 'desc' });
  }
}