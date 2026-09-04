/**
 * @class DocumentationPermission
 * @description Defines all permissions related to the Documentation Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationPermission {
  /**
   * Returns an array of permission definitions for the Documentation Center module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'documentationcenter.dashboard.view', description: 'View the main documentation portal' },
      { id: 'documentationcenter.catalog.view', description: 'View the documentation catalog' },
      { id: 'documentationcenter.document.view', description: 'View individual documents' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('documentationcenter', DocumentationPermission.getPermissions());