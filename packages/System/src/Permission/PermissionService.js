/**
 * Exposes permission definitions used by the System package.
 * @class
 */
class PermissionService {
  /**
   * Creates a permission service.
   */
  constructor() {
    this.permissions = new Set();
  }

  /**
   * Registers a permission.
   * @param {string} permissionName - Permission name.
   */
  register(permissionName) {
    this.permissions.add(permissionName);
  }

  /**
   * Checks whether a permission exists.
   * @param {string} permissionName - Permission name.
   * @returns {boolean} True when available.
   */
  has(permissionName) {
    return this.permissions.has(permissionName);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PermissionService };
}
