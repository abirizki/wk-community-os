/**
 * @class PBBRule
 * @description Encapsulates a specific, complex business rule for the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBRule {
  /**
   * @param {object} context - Any dependencies needed for the rule, e.g., services or repositories.
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Evaluates the business rule against a given data object.
   * @param {object} sppt - The SPPT data to evaluate.
   * @returns {boolean} True if the rule passes, false otherwise.
   * @throws {Error} If the rule check results in a hard failure.
   */
  isOverdue(sppt) {
    if (!sppt || !sppt.dueDate || sppt.status === 'PAID') {
      return false; // Not overdue if no due date or already paid
    }

    const today = new Date();
    const dueDate = new Date(sppt.dueDate);
    return today > dueDate;
  }
}