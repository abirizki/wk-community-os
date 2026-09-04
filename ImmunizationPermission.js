/**
 * @class ImmunizationPermission
 * @description Defines all permissions related to the Immunization package.
 */
class ImmunizationPermission {
  /**
   * Returns an array of permission definitions for the Immunization module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'immunization.record';
    return [
      { id: `${resource}.create`, description: 'Create a new immunization record' },
      { id: `${resource}.read.own`, description: 'Read own immunization records' },
      { id: `${resource}.read.all`, description: 'Read any immunization record' },
      { id: `${resource}.update.own`, description: 'Update own immunization records' },
      { id: `${resource}.update.all`, description: 'Update any immunization record' },
      { id: `${resource}.delete`, description: 'Delete an immunization record' },
      { id: `${resource}.change.status`, description: 'Change immunization administration status' },
      { id: `${resource}.view.sensitive_notes`, description: 'View sensitive immunization notes' },
      { id: 'immunization.statistics.view', description: 'View immunization statistics' },
      { id: 'immunization.dashboard.view', description: 'View the main immunization dashboard' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerImmunizationPermissions() {
  WK.permission('immunization', ImmunizationPermission.getPermissions());
}