/**
 * @file RegulationPermission.js
 * @description Role-Based Access Control (RBAC) authorization layer for the Regulation module.
 */

class RegulationPermission {
  /**
   * @param {object} [security=null] - Security service instance.
   */
  constructor(security = null) {
    /** @private */
    this.security = security || (typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null);
  }

  /**
   * Checks if the active user possesses the given permission. Throws an Error if denied.
   * @param {string} permission - The permission string to verify.
   * @throws {Error} If permission is denied.
   */
  check(permission) {
    if (this.security && typeof this.security.checkPermission === 'function') {
      try {
        this.security.checkPermission(permission);
      } catch (e) {
        throw new Error(`Regulation Permission denied for '${permission}': ${e.message}`);
      }
    }
  }

  /**
   * Verifies if the active user possesses the given permission without throwing.
   * @param {string} permission - The permission string to verify.
   * @returns {boolean}
   */
  has(permission) {
    if (this.security && typeof this.security.hasPermission === 'function') {
      try {
        return this.security.hasPermission(permission);
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  // --- Granular Permission Checks ---

  checkReadOwnScope() {
    this.check('regulation.read.own_scope');
  }

  checkCreateRegulation() {
    this.check('regulation.create');
  }

  checkEnactRegulation() {
    this.check('regulation.enact');
  }

  checkSupersedeRegulation() {
    this.check('regulation.supersede');
  }

  checkRevokeRegulation() {
    this.check('regulation.revoke');
  }

  checkViewStatistics() {
    this.check('regulation.statistics.view');
  }

  /**
   * Returns metadata for all registered Regulation permissions.
   * @returns {object[]}
   */
  static getPermissions() {
    return [
      { id: 'regulation.read.own_scope', description: 'Read enacted community regulations and ordinances' },
      { id: 'regulation.create', description: 'Draft and propose local regulation articles and bylaws' },
      { id: 'regulation.enact', description: 'Formally enact and promulgate local community regulations' },
      { id: 'regulation.supersede', description: 'Supersede an active regulation with a newer codified statute' },
      { id: 'regulation.revoke', description: 'Revoke and repeal an active community regulation' },
      { id: 'regulation.statistics.view', description: 'View regulation compliance and governance metrics' },
    ];
  }
}

module.exports = RegulationPermission;

