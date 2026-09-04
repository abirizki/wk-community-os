/**
 * @file AspirationValidator.js
 * @description Payload validator for the Aspiration (Usulan & Musrenbang Warga) module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

const { AspirationConstants } = require('./AspirationEntity.js');

class AspirationValidator {
  /**
   * Validate payload for submitting a new citizen aspiration.
   * @param {Object} payload
   */
  validateSubmit(payload = {}) {
    const errors = [];

    if (!payload.citizenId) errors.push('citizenId is required (NIK Pengusul)');
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('title is required and cannot be empty');
    }
    if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length === 0) {
      errors.push('description is required and cannot be empty');
    }
    if (!payload.category) {
      errors.push('category is required');
    } else if (!AspirationConstants.ASPIRATION_CATEGORIES.includes(payload.category)) {
      errors.push(`category must be one of: [${AspirationConstants.ASPIRATION_CATEGORIES.join(', ')}]`);
    }
    if (!payload.location || typeof payload.location !== 'string' || payload.location.trim().length === 0) {
      errors.push('location is required and cannot be empty');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for scheduling Musrenbang meeting discussion.
   * @param {Object} payload
   */
  validateSchedule(payload = {}) {
    const errors = [];

    if (!payload.scheduledMeetingDate) {
      errors.push('scheduledMeetingDate is required when scheduling Musrenbang discussion');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for final Musrenbang decision (ACCEPTED / DEFERRED / REJECTED).
   * @param {string} decision
   * @param {Object} payload
   */
  validateDecision(decision, payload = {}) {
    const errors = [];
    const validDecisions = ['ACCEPTED', 'DEFERRED', 'REJECTED'];

    if (!validDecisions.includes(decision)) {
      errors.push(`Invalid decision '${decision}'. Allowed: [${validDecisions.join(', ')}]`);
    }

    if (decision === 'REJECTED') {
      if (!payload.rejectedReason || typeof payload.rejectedReason !== 'string' || payload.rejectedReason.trim().length === 0) {
        errors.push('rejectedReason is required and cannot be empty when rejecting an aspiration');
      }
    } else if (decision === 'ACCEPTED' || decision === 'DEFERRED') {
      if (!payload.finalDecisionNotes || typeof payload.finalDecisionNotes !== 'string' || payload.finalDecisionNotes.trim().length === 0) {
        errors.push('finalDecisionNotes is required when accepting or deferring an aspiration');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { AspirationValidator };

