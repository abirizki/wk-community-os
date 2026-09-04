/**
 * @class PBBPermission
 * @description Defines and enforces permission checks for PBB (Pajak Bumi dan Bangunan) operations.
 */
class PBBPermission {
  /**
   * Checks if the current user has the required permission for PBB operations.
   * @param {string} permission - The permission to check for.
   * @throws {Error} If the user does not have the required permission.
   */
  check(permission) {
    try {
      WK.security().checkPermission(permission);
    } catch (e) {
      throw new Error(`PBB Permission denied for '${permission}': ${e.message}`);
    }
  }

  /**
   * Performs permission check without throwing (returns boolean).
   * @param {string} permission - The permission to check for.
   * @returns {boolean} True if the user has the permission.
   */
  has(permission) {
    try {
      return WK.security().hasPermission(permission);
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if user can create SPPT records.
   */
  checkCreateSppt() {
    this.check('pbb.sppt.create');
  }

  /**
   * Checks if user can read SPPT records (all data).
   */
  checkReadSppt() {
    this.check('pbb.sppt.read.all');
  }

  /**
   * Checks if user can read SPPT records (unauthenticated - NOP lookup).
   */
  checkReadSpptUnauthenticated() {
    this.check('pbb.sppt.read.unauthenticated');
  }

  /**
   * Checks if user can search SPPT records.
   */
  checkSearchSppt() {
    this.check('pbb.sppt.search');
  }

  /**
   * Checks if user can delete SPPT records.
   */
  checkDeleteSppt() {
    this.check('pbb.sppt.delete');
  }

  /**
   * Checks if user can confirm payments.
   */
  checkConfirmPayment() {
    this.check('pbb.payment.confirm');
  }

  /**
   * Checks if user can validate payments (before confirmation).
   */
  checkValidatePayment() {
    this.check('pbb.payment.validate');
  }

  /**
   * Checks if user can mark PBB records as overdue.
   */
  checkMarkOverdue() {
    this.check('pbb.overdue.mark');
  }

  /**
   * Checks if user can update object category.
   */
  checkUpdateCategory() {
    this.check('pbb.category.update');
  }

  /**
   * Checks if user can view statistics.
   */
  checkViewStatistics() {
    this.check('pbb.statistics.view');
  }

  /**
   * Checks if user can export PBB data.
   */
  checkExportData() {
    this.check('pbb.data.export');
  }

  /**
   * Checks if user has read access to citizen master data (for PBB sppt creation).
   */
  checkReadCitizenData() {
    this.check('citizen.profile.read.unauthenticated');
  }

  /**
   * Checks if user has read access to master data (for PBB sppt creation).
   */
  checkReadMasterData() {
    this.check('masterdata.read');
  }

  /**
   * Checks if user has write access to mailbox (for PBB reminders).
   */
  checkWriteMailbox() {
    this.check('mailbox.write');
  }
}

// Static instance for convenient access
PBBPermission.Instance = new PBBPermission();

module.exports = PBBPermission;
