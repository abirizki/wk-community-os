/**
 * @class ReportingPermission
 * @description Defines all permissions related to the Reporting Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportingPermission {
  /**
   * Returns an array of permission definitions for the Reporting Center module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'reportingcenter.dashboard.view', description: 'View the main reporting dashboard' },
      { id: 'reportingcenter.report.health_monthly_summary.generate', description: 'Generate the Monthly Health Summary report' },
      // [TODO: Add specific generate permissions for every report]
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('reportingcenter', ReportingPermission.getPermissions());