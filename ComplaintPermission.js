/**
 * @class ComplaintPermission
 * @description Defines all permissions related to the Complaint package.
 */
class ComplaintPermission {
  /**
   * Returns an array of permission definitions for the Complaint module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'complaint.record';
    return [
      { id: `${resource}.create`, description: 'Create a new complaint record' },
      { id: `${resource}.read.own`, description: 'Read own complaint records' },
      { id: `${resource}.read.all`, description: 'Read any complaint record' },
      { id: `${resource}.update.own`, description: 'Update own complaint records (e.g., add details if not yet assigned)' },
      { id: `${resource}.update.all`, description: 'Update any complaint record' },
      { id: `${resource}.delete`, description: 'Delete a complaint record' },
      { id: `${resource}.assign`, description: 'Assign a complaint to a user or role' },
      { id: `${resource}.process`, description: 'Process a complaint (e.g., add resolution notes)' },
      { id: `${resource}.resolve`, description: 'Mark a complaint as resolved' },
      { id: `${resource}.close`, description: 'Close a resolved complaint' },
      { id: `${resource}.reopen`, description: 'Reopen a closed or resolved complaint' },
      { id: 'complaint.dashboard.view', description: 'View the main complaint dashboard' },
      { id: 'complaint.statistics.view', description: 'View complaint statistics' },
      { id: 'complaint.category.manage', description: 'Manage complaint categories' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 */
function registerComplaintPermissions() {
  WK.permission('complaint', ComplaintPermission.getPermissions());
}