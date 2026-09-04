/**
 * @file FinancialValidator.js
 * @description Payload validator for the Financial module.
 */

class FinancialValidator {
  /**
   * Validate payload for generating monthly bills.
   */
  validateGenerateBills(payload) {
    const errors = [];
    if (!payload.period) {
      errors.push('period is required');
    } else if (!/^\d{4}-\d{2}$/.test(payload.period)) {
      errors.push('period must be in YYYY-MM format (e.g., "2026-09")');
    }
    if (payload.amount === undefined || payload.amount === null) {
      errors.push('amount is required');
    } else if (typeof payload.amount !== 'number' || payload.amount <= 0) {
      errors.push('amount must be a positive number');
    }
    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for manual cash transaction.
   */
  validateManualTransaction(payload) {
    const errors = [];
    if (!payload.type) errors.push('type is required');
    if (!payload.category) errors.push('category is required');
    if (payload.amount === undefined || payload.amount === null) {
      errors.push('amount is required');
    } else if (typeof payload.amount !== 'number' || payload.amount <= 0) {
      errors.push('amount must be a positive number');
    }
    if (!payload.description) errors.push('description is required');
    if (!payload.transactionDate) errors.push('transactionDate is required');
    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for recording a dues payment.
   */
  validatePaymentRecord(payload) {
    const errors = [];
    if (!payload.paidByUserId) errors.push('paidByUserId is required');
    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { FinancialValidator };

