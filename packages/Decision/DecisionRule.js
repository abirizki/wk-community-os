/**
 * @file DecisionRule.js
 * @description Encapsulates business logic, lifecycle transition rules, and legal immutability for the Decision module.
 */

// Import or fallback to DecisionConstants
let DecisionConstants;
try {
  ({ DecisionConstants } = require('./DecisionEntity.js'));
} catch (e) {
  DecisionConstants = {
    CATEGORIES: ['ANGGARAN_KEUANGAN', 'TATA_TERTIB_LINGKUNGAN', 'KEAMANAN_RONDA', 'KEBERSIHAN_INFRASTRUKTUR', 'KEGIATAN_SOSIAL', 'LAINNYA'],
    SCOPE_TYPES: ['RT', 'RW', 'KELURAHAN'],
    STATUSES: ['DRAFT', 'RATIFIED', 'SUPERSEDED', 'REVOKED'],
    TARGET_TYPES: ['ALL_CITIZENS', 'FAMILY_HEADS', 'SPECIFIC_RT', 'MERCHANTS', 'COMMITTEE'],
  };
}

class DecisionRule {
  /**
   * @param {DecisionRepository} decisionRepository
   * @param {object} [meetingRepository=null]
   */
  constructor(decisionRepository, meetingRepository = null) {
    /** @private */
    this.repository = decisionRepository;
    /** @private */
    this.meetingRepository = meetingRepository;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('DecisionRule') : console;

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['RATIFIED', 'REVOKED'],
      'RATIFIED': ['SUPERSEDED', 'REVOKED'],
      'SUPERSEDED': [],
      'REVOKED': [],
    };
  }

  /**
   * Validates if the category is permitted.
   * @param {string} category - Decision category.
   * @throws {Error} If category is invalid.
   */
  checkValidCategory(category) {
    const validCategories = DecisionConstants.CATEGORIES || [];
    if (!category || !validCategories.includes(category)) {
      throw new Error(`Invalid decision category '${category}'. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  /**
   * Validates if the scope type is permitted.
   * @param {string} scope - Scope type ('RT', 'RW', 'KELURAHAN').
   * @throws {Error} If scope is invalid.
   */
  checkValidScopeType(scope) {
    const validScopes = DecisionConstants.SCOPE_TYPES || [];
    if (!scope || !validScopes.includes(scope)) {
      throw new Error(`Invalid scope type '${scope}'. Must be one of: ${validScopes.join(', ')}`);
    }
  }

  /**
   * Validates if the policy target type is permitted.
   * @param {string} targetType - Target audience type.
   * @throws {Error} If target type is invalid.
   */
  checkValidTargetType(targetType) {
    const validTargets = DecisionConstants.TARGET_TYPES || [];
    if (!targetType || !validTargets.includes(targetType)) {
      throw new Error(`Invalid policy target type '${targetType}'. Must be one of: ${validTargets.join(', ')}`);
    }
  }

  /**
   * Verifies that the decision is linked to a valid meeting reference.
   * @param {string} meetingId - Linked meeting ID.
   * @throws {Error} If meeting ID is missing or invalid.
   */
  checkMeetingReference(meetingId) {
    if (!meetingId || typeof meetingId !== 'string' || meetingId.trim() === '') {
      throw new Error('A formal Decision must be anchored to a valid meeting ID (meetingId).');
    }

    if (this.meetingRepository && typeof this.meetingRepository.findMeetingById === 'function') {
      const meeting = this.meetingRepository.findMeetingById(meetingId);
      if (!meeting) {
        throw new Error(`Anchored meeting with ID '${meetingId}' does not exist.`);
      }
    }
  }

  /**
   * Validates if the decision status transition is permitted.
   * @param {string} currentStatus - Current status.
   * @param {string} nextStatus - Target status.
   * @throws {Error} If transition is illegal.
   */
  checkStatusTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
      return;
    }
    const allowed = this.allowedStatusTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid decision status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }

  /**
   * Enforces immutability on ratified, superseded, or revoked decisions.
   * @param {object} decision - Decision entity or record.
   * @throws {Error} If decision is ratified/locked.
   */
  checkImmutability(decision) {
    if (!decision) {
      throw new Error('Decision does not exist.');
    }
    if (decision.status === 'RATIFIED') {
      throw new Error('This decision has been ratified and is legally binding (immutable). Modifications require issuing a superseding decision.');
    }
    if (decision.status === 'SUPERSEDED') {
      throw new Error('This decision has been superseded by a newer decree and cannot be modified.');
    }
    if (decision.status === 'REVOKED') {
      throw new Error('This decision has been revoked and cannot be modified.');
    }
  }
}

module.exports = DecisionRule;

