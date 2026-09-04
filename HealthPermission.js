/**
 * @class HealthPermission
 * @description Defines all permissions related to the Health package.
 */
class HealthPermission {
  /**
   * Returns an array of permission definitions for the Health module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'health.profile';
    return [
      { id: `${resource}.create`, description: 'Create a new citizen health profile' },
      { id: `${resource}.read.own`, description: 'Read own citizen health profile' },
      { id: `${resource}.read.all`, description: 'Read any citizen health profile' },
      { id: `${resource}.update.own`, description: 'Update own citizen health profile' },
      { id: `${resource}.update.all`, description: 'Update any citizen health profile' },
      { id: `${resource}.delete`, description: 'Delete a citizen health profile' },
      { id: 'health.dashboard.view', description: 'View the main health dashboard' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerHealthPermissions() {
  WK.permission('health', HealthPermission.getPermissions());
}