/**
 * @class MonitoringPermission
 * @description Defines all permissions related to the Monitoring Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class MonitoringPermission {
  /**
   * Returns an array of permission definitions for the Monitoring Center module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'monitoringcenter.dashboard.view', description: 'View the main monitoring dashboard' },
      { id: 'monitoringcenter.metrics.collect', description: 'Internal permission to collect system metrics' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('monitoringcenter', MonitoringPermission.getPermissions());