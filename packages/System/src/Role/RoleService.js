/**
 * Provides minimal role-based access control for the System package.
 * @class
 */
class RoleService {
  /**
   * Creates a role service.
   */
  constructor() {
    this.roles = new Map();
  }

  /**
   * Registers a role with its permitted actions.
   * @param {string} roleName - Role name.
   * @param {Array<string>} permissions - Permissions list.
   */
  register(roleName, permissions) {
    this.roles.set(roleName, new Set(permissions || []));
  }

  /**
   * Checks whether a role has a permission.
   * @param {string} roleName - Role name.
   * @param {string} permissionName - Permission name.
   * @returns {boolean} True when granted.
   */
  hasPermission(roleName, permissionName) {
    const permissions = this.roles.get(roleName);
    return Boolean(permissions && permissions.has(permissionName));
  }

  /**
   * Returns the full role map.
   * @returns {Map} Role definitions.
   */
  getRoles() {
    return this.roles;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RoleService };
}
