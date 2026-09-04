/**
 * @class AdministrativeServicePermission
 * @description Defines all permissions related to the AdministrativeService package.
 */
class AdministrativeServicePermission {
  /**
   * Returns an array of permission definitions for the AdministrativeService module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'administrativeservice.request';
    return [
      { id: `${resource}.create`, description: 'Create a new administrative service request' },
      { id: `${resource}.read.own`, description: 'Read own administrative service requests' },
      { id: `${resource}.read.all`, description: 'Read any administrative service request' },
      { id: `${resource}.update.own`, description: 'Update own administrative service requests' },
      { id: `${resource}.update.all`, description: 'Update any administrative service request' },
      { id: `${resource}.delete`, description: 'Delete an administrative service request' },
      { id: `${resource}.change.status`, description: 'Change the status of an administrative service request' },
      { id: `${resource}.verify.rt`, description: 'Verify an administrative service request by RT' },
      { id: `${resource}.verify.rw`, description: 'Verify an administrative service request by RW' },
      { id: `${resource}.process.kelurahan`, description: 'Process an administrative service request by Kelurahan' },
      { id: 'administrativeservice.dashboard.view', description: 'View the main administrative service dashboard' },
      { id: 'administrativeservice.statistics.view', description: 'View administrative service statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerAdministrativeServicePermissions() {
  // Assuming a global permission registry exists, like WK.permission
  if (WK && typeof WK.permission === 'function') {
    WK.permission('administrativeservice', AdministrativeServicePermission.getPermissions());
  }
}