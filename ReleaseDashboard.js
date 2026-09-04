/**
 * @class ReleaseDashboard
 * @description Defines the dashboard for the Release Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleaseDashboard {
  /**
   * Returns an array of widget definitions for the dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'release_manager_portal',
        title: 'Release Management',
        type: 'release_manager_ui', // A custom UI component for managing releases
        dataSource: 'ReleaseService.getReleaseHistory',
        size: 'full_page',
        permission: 'releasecenter.dashboard.view'
      }
    ];
  }
}

// Register the dashboard with the framework
WK.dashboard('release_center', ReleaseDashboard.getWidgets());