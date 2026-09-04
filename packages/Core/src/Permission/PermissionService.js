/**
 * Evaluates permission checks for the platform.
 * @class
 */
class PermissionService {
  /**
   * Creates a permission service.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(loggerService) {
    this.logger = loggerService || new LoggerService();
    this.permissions = new Map();
  }

  /**
   * Registers a permission.
   * @param {string} permissionKey - Permission identifier.
   */
  register(permissionKey) {
    this.permissions.set(permissionKey, true);
    this.logger.info(`Permission registered: ${permissionKey}`, { permissionKey });
  }

  /**
   * Checks whether a permission exists.
   * @param {string} permissionKey - Permission identifier.
   * @returns {boolean} True when allowed.
   */
  can(permissionKey) {
    return this.permissions.has(permissionKey);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PermissionService
  };
}
