/**
 * Enforces authorization decisions for the platform.
 * @class
 */
class AuthorizationService {
  /**
   * Creates an authorization service.
   * @param {PermissionService} permissionService - Permission service.
   * @param {RoleService} roleService - Role service.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(permissionService, roleService, loggerService) {
    this.permissionService = permissionService;
    this.roleService = roleService;
    this.logger = loggerService || new LoggerService();
  }

  /**
   * Checks authorization for a role against a permission.
   * @param {string} roleName - Role name.
   * @param {string} permissionKey - Permission key.
   * @returns {boolean} True when authorized.
   */
  authorize(roleName, permissionKey) {
    const permissionAllowed = this.permissionService.can(permissionKey);
    const roleAllowed = this.roleService.can(roleName, permissionKey);
    const allowed = permissionAllowed && roleAllowed;
    this.logger.info('Authorization evaluated', { roleName, permissionKey, allowed });
    return allowed;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AuthorizationService
  };
}
