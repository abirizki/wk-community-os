/**
 * Manages role-based access for the platform.
 * @class
 */
class RoleService {
  /**
   * Creates a role service.
   * @param {PermissionService} permissionService - Permission service.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(permissionService, loggerService) {
    this.permissionService = permissionService;
    this.logger = loggerService || new LoggerService();
    this.roles = new Map();
  }

  /**
   * Registers a role and its permissions.
   * @param {string} roleName - Role name.
   * @param {Array<string>} permissions - Permission names.
   */
  register(roleName, permissions) {
    this.roles.set(roleName, new Set(permissions || []));
    this.logger.info(`Role registered: ${roleName}`, { roleName });
  }

  /**
   * Checks whether the role can perform an action.
   * @param {string} roleName - Role name.
   * @param {string} permissionKey - Permission key.
   * @returns {boolean} True when allowed.
   */
  can(roleName, permissionKey) {
    const permissions = this.roles.get(roleName);
    return Boolean(permissions && permissions.has(permissionKey));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RoleService
  };
}
