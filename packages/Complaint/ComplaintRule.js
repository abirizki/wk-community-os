/**
 * @file ComplaintRule.js
 * @description Business rules and status workflow integrity logic for the Complaint module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { ComplaintConstants } = require('./ComplaintEntity.js');

class ComplaintRule {
  /**
   * Check whether the complaint is in a terminal status (CLOSED, REJECTED).
   * @param {string} currentStatus
   */
  checkTerminalStatus(currentStatus) {
    if (ComplaintConstants.TERMINAL_STATUSES.includes(currentStatus)) {
      throw new Error(
        `Business Rule Violation: Complaint with status '${currentStatus}' is terminal and cannot be modified.`
      );
    }
  }

  /**
   * Enforce valid complaint resolution workflow transitions:
   * NEW -> VERIFIED | REJECTED
   * VERIFIED -> IN_PROGRESS | REJECTED
   * IN_PROGRESS -> RESOLVED | REJECTED
   * RESOLVED -> CLOSED | REOPENED | IN_PROGRESS
   * REOPENED -> IN_PROGRESS
   * @param {string} currentStatus
   * @param {string} nextStatus
   */
  checkStatusTransition(currentStatus, nextStatus) {
    // 1. Terminal status check must always execute first
    this.checkTerminalStatus(currentStatus);

    if (currentStatus === nextStatus) return;

    const validTransitions = {
      NEW: ['VERIFIED', 'REJECTED'],
      VERIFIED: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['RESOLVED', 'REJECTED'],
      RESOLVED: ['CLOSED', 'REOPENED', 'IN_PROGRESS'],
      REOPENED: ['IN_PROGRESS'],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new Error(
        `Business Rule Violation: Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed: [${allowedNext.join(', ')}].`
      );
    }
  }

  /**
   * Validate that resolution evidence (photos/documents) is provided when resolving a complaint.
   * @param {Array<string>} evidenceArray
   */
  checkResolutionEvidence(evidenceArray) {
    if (!Array.isArray(evidenceArray) || evidenceArray.length === 0) {
      throw new Error(
        'Business Rule Violation: Resolution evidence (photos/documentation) is required to resolve a complaint.'
      );
    }
  }

  /**
   * Validate complaint category enum.
   * @param {string} category
   */
  checkValidCategory(category) {
    if (!ComplaintConstants.COMPLAINT_CATEGORIES.includes(category)) {
      throw new Error(
        `Business Rule Violation: Invalid complaint category '${category}'. Allowed: [${ComplaintConstants.COMPLAINT_CATEGORIES.join(', ')}].`
      );
    }
  }

  /**
   * Validate complaint priority enum.
   * @param {string} priority
   */
  checkValidPriority(priority) {
    if (!ComplaintConstants.COMPLAINT_PRIORITIES.includes(priority)) {
      throw new Error(
        `Business Rule Violation: Invalid complaint priority '${priority}'. Allowed: [${ComplaintConstants.COMPLAINT_PRIORITIES.join(', ')}].`
      );
    }
  }
}

module.exports = { ComplaintRule };

