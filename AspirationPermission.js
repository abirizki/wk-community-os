/**
 * @class AspirationPermission
 * @description Defines all permissions related to the Aspiration package.
 */
class AspirationPermission {
  /**
   * Returns an array of permission definitions for the Aspiration module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'aspiration.record';
    return [
      { id: `${resource}.create`, description: 'Create a new aspiration record' },
      { id: `${resource}.read.own`, description: 'Read own aspiration records' },
      { id: `${resource}.read.all`, description: 'Read any aspiration record' },
      { id: `${resource}.update.own`, description: 'Update own aspiration records (e.g., add details if not yet assigned)' },
      { id: `${resource}.update.all`, description: 'Update any aspiration record' },
      { id: `${resource}.delete`, description: 'Delete an aspiration record' },
      { id: `${resource}.assign`, description: 'Assign an aspiration for review/implementation' },
      { id: `${resource}.process`, description: 'Process an aspiration (e.g., add resolution notes)' },
      { id: `${resource}.vote`, description: 'Upvote or downvote an aspiration' },
      { id: `${resource}.implement`, description: 'Mark an aspiration as implemented' },
      { id: `${resource}.archive`, description: 'Archive an aspiration' },
      { id: 'aspiration.dashboard.view', description: 'View the main aspiration dashboard' },
      { id: 'aspiration.statistics.view', description: 'View aspiration statistics' },
      { id: 'aspiration.category.manage', description: 'Manage aspiration categories' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 */
function registerAspirationPermissions() {
  WK.permission('aspiration', AspirationPermission.getPermissions());
}