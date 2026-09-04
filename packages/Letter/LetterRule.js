/**
 * @file LetterRule.js
 * @description Business rules and status workflow integrity logic for the Letter module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { LetterConstants } = require('./LetterEntity.js');

class LetterRule {
  /**
   * Check whether the letter is in a terminal status (APPROVED, REJECTED).
   * @param {string} currentStatus
   */
  checkTerminalStatus(currentStatus) {
    if (LetterConstants.TERMINAL_STATUSES.includes(currentStatus)) {
      throw new Error(
        `Business Rule Violation: Letter with status '${currentStatus}' is terminal and cannot be modified.`
      );
    }
  }

  /**
   * Enforce valid status transition:
   * DRAFT -> WAITING_RT
   * WAITING_RT -> WAITING_RW | REJECTED
   * WAITING_RW -> WAITING_KELURAHAN | REJECTED
   * WAITING_KELURAHAN -> APPROVED | REJECTED
   * @param {string} currentStatus
   * @param {string} nextStatus
   */
  checkStatusTransition(currentStatus, nextStatus) {
    // 1. Terminal status check must always execute first
    this.checkTerminalStatus(currentStatus);

    if (currentStatus === nextStatus) return;

    const validTransitions = {
      DRAFT: ['WAITING_RT', 'REJECTED'],
      WAITING_RT: ['WAITING_RW', 'REJECTED'],
      WAITING_RW: ['WAITING_KELURAHAN', 'REJECTED'],
      WAITING_KELURAHAN: ['APPROVED', 'REJECTED'],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new Error(
        `Business Rule Violation: Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed: [${allowedNext.join(', ')}].`
      );
    }
  }

  /**
   * Validate completeness of required attachments for a given letter type.
   * @param {string} type - Letter type
   * @param {Array<string>} providedAttachments - List of attachment names/paths provided
   */
  checkAttachmentsCompleteness(type, providedAttachments = []) {
    const required = LetterConstants.REQUIRED_ATTACHMENTS[type] || [];
    if (required.length === 0) return;

    const missing = required.filter(req => {
      return !providedAttachments.some(prov => {
        if (typeof prov === 'string') {
          return prov.toLowerCase().includes(req.toLowerCase());
        }
        return false;
      });
    });

    if (missing.length > 0) {
      throw new Error(
        `Business Rule Violation: Incomplete attachments for letter type '${type}'. Missing required documents: [${missing.join(', ')}].`
      );
    }
  }

  /**
   * Validate letter type enum.
   * @param {string} type
   */
  checkValidLetterType(type) {
    if (!LetterConstants.LETTER_TYPES.includes(type)) {
      throw new Error(
        `Business Rule Violation: Invalid letter type '${type}'. Allowed: [${LetterConstants.LETTER_TYPES.join(', ')}].`
      );
    }
  }
}

module.exports = { LetterRule };

