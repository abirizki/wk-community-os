/**
 * @class PosyanduPermission
 * @description Defines all permissions related to the Posyandu package.
 */
class PosyanduPermission {
  /**
   * Returns an array of permission definitions for the Posyandu module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'posyandu.visit';
    return [
      { id: `${resource}.create`, description: 'Create a new Posyandu visit record' },
      { id: `${resource}.read.own`, description: 'Read own Posyandu visit records' },
      { id: `${resource}.read.all`, description: 'Read any Posyandu visit records' },
      { id: `${resource}.update.own`, description: 'Update own Posyandu visit records' },
      { id: `${resource}.update.all`, description: 'Update any Posyandu visit records' },
      { id: `${resource}.delete`, description: 'Delete a Posyandu visit record' },
      { id: 'posyandu.dashboard.view', description: 'View the main Posyandu dashboard' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 */
function registerPosyanduPermissions() {
  WK.permission('posyandu', PosyanduPermission.getPermissions());
}