/**
 * Provides authorization and access validation for the System package.
 * @class
 */
class AuthorizationService {
  /**
   * Creates an authorization service.
   * @param {Object} roleService - Role service.
   * @param {Object} permissionService - Permission service.
   */
  constructor(roleService, permissionService) {
    this.roleService = roleService || new RoleService();
    this.permissionService = permissionService || new PermissionService();
  }

  /**
   * Validates whether a role can access a permission.
   * @param {string} roleName - Role name.
   * @param {string} permissionName - Permission name.
   * @returns {boolean} True when allowed.
   */
  canAccess(roleName, permissionName) {
    return this.roleService.hasPermission(roleName, permissionName);
  }

  /**
   * Validates whether a role is authorized.
   * @param {string} roleName - Role name.
   * @param {string} permissionName - Permission name.
   * @returns {boolean} True when authorized.
   */
  authorize(roleName, permissionName) {
    return this.canAccess(roleName, permissionName);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthorizationService };
}
