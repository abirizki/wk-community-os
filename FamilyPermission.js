/**
 * @class FamilyPermission
 * @description Defines all permissions related to the Family package.
 */
class FamilyPermission {
  /**
   * Returns an array of permission definitions for the Family module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'family.profile';
    return [
      { id: `${resource}.create`, description: 'Create a new family profile' },
      { id: `${resource}.read.own`, description: 'Read own family profile' },
      { id: `${resource}.read.all`, description: 'Read any family profile' },
      { id: `${resource}.update.all`, description: 'Update any family profile' },
      { id: `${resource}.delete`, description: 'Delete a family profile' },
      { id: `${resource}.members.manage`, description: 'Add or remove members from a family' },
      { id: 'family.dashboard.view', description: 'View the main family dashboard' },
      { id: 'family.statistics.view', description: 'View family statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerFamilyPermissions() {
  WK.permission('family', FamilyPermission.getPermissions());
}