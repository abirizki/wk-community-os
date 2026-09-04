/**
 * @class CitizenPermission
 * @description Defines all permissions related to the Citizen package.
 */
class CitizenPermission {
  /**
   * Returns an array of permission definitions for the Citizen module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'citizen.profile';
    return [
      { id: `${resource}.create`, description: 'Create a new citizen profile' },
      { id: `${resource}.read.own`, description: 'Read own citizen profile' },
      { id: `${resource}.read.all`, description: 'Read any citizen profile' },
      { id: `${resource}.update.own`, description: 'Update own citizen profile' },
      { id: `${resource}.update.all`, description: 'Update any citizen profile' },
      { id: `${resource}.delete`, description: 'Delete a citizen profile' },
      { id: `${resource}.change.status`, description: 'Change citizen status' },
      { id: `${resource}.view.sensitive_nik`, description: 'View sensitive NIK information' },
      { id: 'citizen.dashboard.view', description: 'View the main citizen dashboard' },
      { id: 'citizen.statistics.view', description: 'View citizen statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerCitizenPermissions() {
  WK.permission('citizen', CitizenPermission.getPermissions());
}