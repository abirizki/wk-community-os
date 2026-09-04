/**
 * @class SystemMetrics
 * @description Provides key system metrics. In Google Apps Script, direct CPU/Memory
 * access is not possible, so we use proxies like execution time.
 */
class SystemMetrics {
  constructor() {
    // This service would be more complex in a traditional server environment.
    // For Apps Script, we rely on what the platform exposes.
  }

  /**
   * Gets metrics related to Apps Script quotas.
   * @returns {object} An object with quota information.
   */
  getQuotaMetrics() {
    WK.security().checkPermission('operations.metrics.view');
    try {
      const dailyTriggerRuntime = ScriptApp.getScriptTriggers().reduce((total, trigger) => total + trigger.getTriggerSourceId() ? 0 : 0, 0); // This is a conceptual example
      const remainingEmailRecipients = MailApp.getRemainingDailyQuota();

      return {
        dailyTriggerRuntime: {
          // Google doesn't provide a direct way to get total runtime used.
          // This would need to be tracked manually by each trigger logging its runtime.
          used: 'N/A',
          limit: '90 min/day'
        },
        emailRecipients: {
          remaining: remainingEmailRecipients,
          limit: '1500/day' // For Google Workspace accounts
        }
      };
    } catch (e) {
      WK.logger().error(`Could not retrieve quota metrics: ${e.message}`);
      return { error: 'Failed to retrieve quota information.' };
    }
  }
}