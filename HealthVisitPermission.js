/**
 * @class HealthVisitPermission
 * @description Defines all permissions related to the HealthVisit package.
 */
class HealthVisitPermission {
  /**
   * Returns an array of permission definitions for the HealthVisit module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'health.visit';
    return [
      { id: `${resource}.create`, description: 'Create a new health visit' },
      { id: `${resource}.read.own`, description: 'Read own health visits' },
      { id: `${resource}.read.all`, description: 'Read any health visit' },
      { id: `${resource}.update.own`, description: 'Update own health visits' },
      { id: `${resource}.update.all`, description: 'Update any health visit' },
      { id: `${resource}.delete`, description: 'Delete a health visit' },
      { id: `${resource}.change.status`, description: 'Change health visit status' },
      { id: `${resource}.view.sensitive_notes`, description: 'View sensitive health visit notes' },
      { id: 'healthvisit.dashboard.view', description: 'View the main health visit dashboard' },
      { id: 'healthvisit.statistics.view', description: 'View health visit statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerHealthVisitPermissions() {
  WK.permission('healthvisit', HealthVisitPermission.getPermissions());
}