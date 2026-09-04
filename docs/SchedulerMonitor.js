/**
 * @class SchedulerMonitor
 * @description Monitors the status of scheduled tasks (time-based triggers).
 */
class SchedulerMonitor {
  constructor() {
    /** @private */
    this.statusCache = WK.cache().getCache('scheduler_status');
  }

  /**
   * Updates the status of a scheduled task.
   * This should be called at the end of every trigger's execution.
   * @param {string} triggerName - The name of the trigger (e.g., 'dailyAnalytics').
   * @param {string} status - 'SUCCESS' or 'FAILED'.
   * @param {string} [message=''] - An optional error message.
   */
  updateStatus(triggerName, status, message = '') {
    const statusRecord = {
      lastRun: new Date().toISOString(),
      status: status,
      message: message
    };
    this.statusCache.put(triggerName, JSON.stringify(statusRecord), 86400 * 2); // Cache for 2 days
  }

  /**
   * Gets the status of all monitored scheduled tasks.
   * @returns {object[]} An array of scheduler status objects.
   */
  getAllSchedulerStatuses() {
    WK.security().checkPermission('operations.scheduler.view');
    const triggerNames = ['processEventBusQueue', 'processNotificationQueue', 'runDailyAnalytics']; // Predefined list
    
    return triggerNames.map(name => {
      const statusRecord = JSON.parse(this.statusCache.get(name) || 'null');
      return {
        name: name,
        ...statusRecord
      };
    });
  }
}