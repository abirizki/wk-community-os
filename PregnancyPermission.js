/**
 * @class PregnancyPermission
 * @description Defines all permissions related to the Pregnancy package.
 */
class PregnancyPermission {
  /**
   * Returns an array of permission definitions for the Pregnancy module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'pregnancy.episode';
    return [
      { id: `${resource}.create`, description: 'Create a new pregnancy record' },
      { id: `${resource}.read.own`, description: 'Read own pregnancy records' },
      { id: `${resource}.read.all`, description: 'Read any pregnancy record' },
      { id: `${resource}.update.own`, description: 'Update own pregnancy records' },
      { id: `${resource}.update.all`, description: 'Update any pregnancy record' },
      { id: `${resource}.delete`, description: 'Delete a pregnancy record' },
      { id: `${resource}.change.status`, description: 'Change pregnancy status' },
      { id: `${resource}.change.risk_status`, description: 'Change pregnancy risk status' },
      { id: `${resource}.view.sensitive_notes`, description: 'View sensitive pregnancy notes' },
      { id: 'pregnancy.dashboard.view', description: 'View the main pregnancy dashboard' },
      { id: 'pregnancy.statistics.view', description: 'View pregnancy statistics' },
      { id: 'pregnancy.export', description: 'Export pregnancy data' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerPregnancyPermissions() {
  WK.permission('pregnancy', PregnancyPermission.getPermissions());
}