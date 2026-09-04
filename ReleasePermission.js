/**
 * @class ReleasePermission
 * @description Defines all permissions related to the Release Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleasePermission {
  /**
   * Returns an array of permission definitions for the Release Center module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'releasecenter.dashboard.view', description: 'View the release management dashboard' },
      { id: 'releasecenter.release.create', description: 'Create a new release candidate' },
      { id: 'releasecenter.upgrade.run', description: 'Initiate a system upgrade to a new release' },
      { id: 'releasecenter.rollback.run', description: 'Initiate a system rollback' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('releasecenter', ReleasePermission.getPermissions());