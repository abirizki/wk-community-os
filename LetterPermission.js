/**
 * @class LetterPermission
 * @description Defines all permissions related to the Letter package.
 */
class LetterPermission {
  /**
   * Returns an array of permission definitions for the Letter module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'letter.document';
    return [
      { id: `${resource}.create`, description: 'Create a new letter document' },
      { id: `${resource}.read.own`, description: 'Read own letter documents' },
      { id: `${resource}.read.all`, description: 'Read any letter document' },
      { id: `${resource}.update.all`, description: 'Update any letter document' },
      { id: `${resource}.delete`, description: 'Delete a letter document' },
      { id: `${resource}.issue`, description: 'Issue (sign and finalize) a letter' },
      { id: `${resource}.revoke`, description: 'Revoke an issued letter' },
      { id: `${resource}.regenerate`, description: 'Regenerate the content of a letter' },
      { id: 'letter.dashboard.view', description: 'View the main letter dashboard' },
      { id: 'letter.statistics.view', description: 'View letter statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 */
function registerLetterPermissions() {
  WK.permission('letter', LetterPermission.getPermissions());
}