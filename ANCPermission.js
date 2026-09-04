/**
 * @class ANCPermission
 * @description Defines all permissions related to the ANC (Antenatal Care) package.
 */
class ANCPermission {
  /**
   * Returns an array of permission definitions for the ANC module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'anc.record';
    return [
      { id: `${resource}.create`, description: 'Create a new ANC record' },
      { id: `${resource}.read.all`, description: 'Read any ANC record' },
      { id: `${resource}.update.all`, description: 'Update any ANC record' },
      { id: `${resource}.delete`, description: 'Delete an ANC record' },
      { id: `${resource}.change.risk_status`, description: 'Change the risk status of an ANC record' },
      { id: 'anc.statistics.view', description: 'View ANC statistics' },
      { id: 'anc.dashboard.view', description: 'View the main ANC dashboard' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerANCPermissions() {
  // Assuming a global permission registry exists, like WK.permission
  if (WK && typeof WK.permission === 'function') {
    WK.permission('anc', ANCPermission.getPermissions());
  }
}