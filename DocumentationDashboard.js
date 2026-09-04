/**
 * @class DocumentationDashboard
 * @description Defines the main dashboard for the Documentation Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationDashboard {
  /**
   * Returns an array of widget definitions for the dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'documentation_portal',
        title: 'Enterprise Documentation Portal',
        type: 'documentation_browser', // A custom UI component for browsing and viewing docs
        dataSource: 'DocumentationService.getDocumentationCatalog',
        size: 'full_page',
        permission: 'documentationcenter.dashboard.view'
      }
    ];
  }
}

// Register the dashboard with the framework
WK.dashboard('documentation_center', DocumentationDashboard.getWidgets());