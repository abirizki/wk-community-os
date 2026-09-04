/**
 * @file AspirationRule.js
 * @description Business rules and status workflow integrity logic for the Aspiration module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

const { AspirationConstants } = require('./AspirationEntity.js');

class AspirationRule {
  /**
   * Check whether the aspiration is in a terminal status (ACCEPTED, REJECTED).
   * @param {string} currentStatus
   */
  checkTerminalStatus(currentStatus) {
    if (AspirationConstants.TERMINAL_STATUSES.includes(currentStatus)) {
      throw new Error(
        `Business Rule Violation: Aspiration with status '${currentStatus}' is terminal and cannot be modified.`
      );
    }
  }

  /**
   * Enforce valid aspiration lifecycle workflow transitions:
   * DRAFT -> PROPOSED
   * PROPOSED -> POLLING | REJECTED
   * POLLING -> SCHEDULING | IN_DISCUSSION | REJECTED
   * SCHEDULING -> IN_DISCUSSION | REJECTED
   * IN_DISCUSSION -> ACCEPTED | DEFERRED | REJECTED
   * DEFERRED -> SCHEDULING | IN_DISCUSSION | POLLING
   * @param {string} currentStatus
   * @param {string} nextStatus
   */
  checkStatusTransition(currentStatus, nextStatus) {
    // 1. Terminal status check must always execute first
    this.checkTerminalStatus(currentStatus);

    if (currentStatus === nextStatus) return;

    const validTransitions = {
      DRAFT: ['PROPOSED'],
      PROPOSED: ['POLLING', 'REJECTED'],
      POLLING: ['SCHEDULING', 'IN_DISCUSSION', 'REJECTED'],
      SCHEDULING: ['IN_DISCUSSION', 'REJECTED'],
      IN_DISCUSSION: ['ACCEPTED', 'DEFERRED', 'REJECTED'],
      DEFERRED: ['SCHEDULING', 'IN_DISCUSSION', 'POLLING'],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new Error(
        `Business Rule Violation: Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed: [${allowedNext.join(', ')}].`
      );
    }
  }

  /**
   * Enforce that voting is only allowed when status is POLLING and within the active polling period.
   * @param {string} status
   * @param {string|null} pollingEndDate
   * @param {Date} currentDate
   */
  checkPollingEligibility(status, pollingEndDate, currentDate = new Date()) {
    if (status !== 'POLLING') {
      throw new Error(
        `Business Rule Violation: Voting is only allowed when aspiration status is 'POLLING'. Current status: '${status}'.`
      );
    }

    if (pollingEndDate && new Date(currentDate) > new Date(pollingEndDate)) {
      throw new Error(
        `Business Rule Violation: Polling period ended on ${pollingEndDate}. Voting is now closed.`
      );
    }
  }

  /**
   * Enforce One-Citizen-One-Vote rule.
   * @param {string} citizenId
   * @param {Array<Object>} existingVotes
   */
  checkOneVoteRule(citizenId, existingVotes = []) {
    const hasVoted = existingVotes.some(v => v.citizenId === citizenId);
    if (hasVoted) {
      throw new Error(
        `Business Rule Violation: Citizen ${citizenId} has already cast a vote for this aspiration. One-Citizen-One-Vote rule strictly enforced.`
      );
    }
  }

  /**
   * Validate category enum.
   * @param {string} category
   */
  checkValidCategory(category) {
    if (!AspirationConstants.ASPIRATION_CATEGORIES.includes(category)) {
      throw new Error(
        `Business Rule Violation: Invalid aspiration category '${category}'. Allowed: [${AspirationConstants.ASPIRATION_CATEGORIES.join(', ')}].`
      );
    }
  }

  /**
   * Validate priority enum.
   * @param {string} priority
   */
  checkValidPriority(priority) {
    if (!AspirationConstants.ASPIRATION_PRIORITIES.includes(priority)) {
      throw new Error(
        `Business Rule Violation: Invalid priority level '${priority}'. Allowed: [${AspirationConstants.ASPIRATION_PRIORITIES.join(', ')}].`
      );
    }
  }
}

module.exports = { AspirationRule };

