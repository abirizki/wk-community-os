/**
 * @class <<permissionName>>
 * @description Defines all permissions related to the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<permissionName>> {
  /**
   * Returns an array of permission definitions for the <<packageName>> module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: '<<permissionPrefix>>.view', description: 'View <<packageName>> data' },
      { id: '<<permissionPrefix>>.create', description: 'Create new <<packageName>> entities' },
      { id: '<<permissionPrefix>>.update', description: 'Update existing <<packageName>> entities' },
      { id: '<<permissionPrefix>>.delete', description: 'Delete <<packageName>> entities' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('<<packageLowercase>>', <<permissionName>>.getPermissions());