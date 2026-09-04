/**
 * @file DecisionPermission.js
 * @description Role-Based Access Control (RBAC) authorization layer for the Decision module.
 */

class DecisionPermission {
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
        throw new Error(`Decision Permission denied for '${permission}': ${e.message}`);
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
    this.check('decision.read.own_scope');
  }

  checkCreateDecision() {
    this.check('decision.create');
  }

  checkRatifyDecision() {
    this.check('decision.ratify');
  }

  checkSupersedeDecision() {
    this.check('decision.supersede');
  }

  checkRevokeDecision() {
    this.check('decision.revoke');
  }

  checkViewStatistics() {
    this.check('decision.statistics.view');
  }

  /**
   * Returns metadata for all registered Decision permissions.
   * @returns {object[]}
   */
  static getPermissions() {
    return [
      { id: 'decision.read.own_scope', description: 'Read ratified decisions and decrees within citizen scope' },
      { id: 'decision.create', description: 'Draft and propose formal decisions from meeting minutes' },
      { id: 'decision.ratify', description: 'Ratify, sign, and enact formal decisions and decrees' },
      { id: 'decision.supersede', description: 'Replace an active decree with an updated formal decision' },
      { id: 'decision.revoke', description: 'Formally revoke or annul an active community decision' },
      { id: 'decision.statistics.view', description: 'View governance decision metrics and policy compliance stats' },
    ];
  }
}

module.exports = DecisionPermission;

