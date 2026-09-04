/**
 * @class MedicinePermission
 * @description Defines all permissions related to the Medicine package.
 */
class MedicinePermission {
  /**
   * Returns an array of permission definitions for the Medicine module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'medicine.master';
    return [
      { id: `${resource}.create`, description: 'Create a new medicine master record' },
      { id: `${resource}.read`, description: 'Read medicine master records' },
      { id: `${resource}.update`, description: 'Update a medicine master record' },
      { id: `${resource}.delete`, description: 'Delete a medicine master record' },
      { id: `${resource}.search`, description: 'Search medicine master records' },
      { id: 'medicine.history.view`, description: 'View citizen medicine usage history' },
      { id: 'medicine.dashboard.view`, description: 'View the main medicine dashboard' },
      { id: 'medicine.statistics.view`, description: 'View medicine statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerMedicinePermissions() {
  WK.permission('medicine', MedicinePermission.getPermissions());
}