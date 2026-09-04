/**
 * @class ReportingDashboard
 * @description Defines the dashboard for the Reporting Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportingDashboard {
  /**
   * Returns an array of widget definitions for the dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'reporting_report_catalog',
        title: 'Available Reports',
        type: 'report_launcher', // A custom UI component to list and launch reports
        dataSource: 'ReportingService.getAvailableReports', // Method to list templates
        size: 'large',
        permission: 'reportingcenter.dashboard.view'
      }
      // [TODO: Add a widget for 'Recently Generated Reports']
    ];
  }
}

// Register the dashboard with the framework
WK.dashboard('reporting_center', ReportingDashboard.getWidgets());