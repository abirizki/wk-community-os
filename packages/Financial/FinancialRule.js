/**
 * @file FinancialRule.js
 * @description Business rules and integrity logic for the Financial module.
 */

const { FinancialConstants } = require('./FinancialEntity.js');

class FinancialRule {
  /**
   * Prevent mutation on terminal statuses (PAID, WAIVED).
   */
  checkTerminalStatus(currentStatus) {
    if (FinancialConstants.DUES_TERMINAL_STATUSES.includes(currentStatus)) {
      throw new Error(
        `Business Rule Violation: DuesBill with status '${currentStatus}' is immutable. Terminal statuses [${FinancialConstants.DUES_TERMINAL_STATUSES.join(', ')}] cannot be modified.`
      );
    }
  }

  /**
   * Ensure 1 family has at most 1 bill per period (YYYY-MM).
   */
  checkUniqueBill(familyId, period, existingBills = []) {
    const duplicate = existingBills.find(b => b.familyId === familyId && b.period === period);
    if (duplicate) {
      throw new Error(
        `Business Rule Violation: DuesBill already exists for family '${familyId}' in period '${period}'. Unique constraint: (familyId, period).`
      );
    }
  }

  /**
   * Validate transaction type enum.
   */
  checkValidTransactionType(type) {
    if (!FinancialConstants.TRANSACTION_TYPES.includes(type)) {
      throw new Error(
        `Business Rule Violation: Invalid transaction type '${type}'. Allowed: ${FinancialConstants.TRANSACTION_TYPES.join(', ')}.`
      );
    }
  }

  /**
   * Validate transaction category enum.
   */
  checkValidTransactionCategory(category) {
    if (!FinancialConstants.TRANSACTION_CATEGORIES.includes(category)) {
      throw new Error(
        `Business Rule Violation: Invalid transaction category '${category}'. Allowed: ${FinancialConstants.TRANSACTION_CATEGORIES.join(', ')}.`
      );
    }
  }

  /**
   * Validate dues status enum.
   */
  checkValidDuesStatus(status) {
    if (!FinancialConstants.DUES_STATUSES.includes(status)) {
      throw new Error(
        `Business Rule Violation: Invalid dues status '${status}'. Allowed: ${FinancialConstants.DUES_STATUSES.join(', ')}.`
      );
    }
  }

  /**
   * Validate period format YYYY-MM.
   */
  checkValidPeriodFormat(period) {
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new Error(
        `Business Rule Violation: Period '${period}' is invalid. Required format: YYYY-MM (e.g., '2026-09').`
      );
    }
  }

  /**
   * Validate amount is positive.
   */
  checkPositiveAmount(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error(`Business Rule Violation: Amount must be a positive number. Got: ${amount}.`);
    }
  }
}

module.exports = { FinancialRule };

