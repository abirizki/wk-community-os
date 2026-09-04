/**
 * @file PBBRule.js
 * @description Business rules engine for PBB tax management (NOP format, due dates, governance score delta).
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

class PBBRule {
  /**
   * Validate NOP format (must be exactly 18 numeric digits).
   * Format example: 32.72.010.001.001.0123.0 -> 18 digits clean.
   * @param {string} nop
   * @returns {boolean}
   */
  validateNopFormat(nop) {
    if (!nop || typeof nop !== 'string') return false;
    const cleanNop = nop.replace(/[\s.-]/g, '');
    return /^\d{18}$/.test(cleanNop);
  }

  /**
   * Calculate Community Governance Score impact based on PBB payment status.
   * @param {string} status - 'PAID', 'OVERDUE', etc.
   * @returns {number} Governance Score Delta (+1 for PAID, -2 for OVERDUE, 0 otherwise)
   */
  calculateGovernanceScore(status) {
    if (status === 'PAID') return 1;
    if (status === 'OVERDUE') return -2;
    return 0;
  }

  /**
   * Evaluate SPPT due date for reminder or overdue escalation.
   * @param {string|Date} dueDate
   * @param {string|Date} currentDate
   * @returns {{ action: string, daysDifference: number }}
   */
  checkBillEscalation(dueDate, currentDate = new Date()) {
    const due = new Date(dueDate);
    const curr = new Date(currentDate);

    // Difference in calendar days
    const diffMs = due.getTime() - curr.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (curr > due && Math.abs(diffDays) >= 1) {
      return { action: 'ESCALATE_OVERDUE', daysDifference: Math.abs(diffDays) };
    } else if (diffDays >= 0 && diffDays <= 30) {
      return { action: 'REMIND_DUE_SOON', daysDifference: diffDays };
    }

    return { action: 'NONE', daysDifference: diffDays };
  }
}

module.exports = { PBBRule };

