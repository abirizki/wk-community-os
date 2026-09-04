/**
 * @file DecisionValidator.js
 * @description Provides payload validation for formal decisions and policy impact declarations.
 */

class DecisionValidator {
  /**
   * @param {DecisionRule} [decisionRule=null]
   */
  constructor(decisionRule = null) {
    /** @private */
    this.rule = decisionRule;
  }

  /**
   * Validates the payload for drafting a new decision.
   * @param {object} payload - Decision creation payload.
   * @throws {Error} If validation fails.
   */
  validateDecisionCreate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Decision payload is required and must be an object.');
    }
    if (!payload.meetingId || typeof payload.meetingId !== 'string' || payload.meetingId.trim() === '') {
      throw new Error('Meeting reference ID (meetingId) is required.');
    }
    if (!payload.decisionNumber || typeof payload.decisionNumber !== 'string' || payload.decisionNumber.trim() === '') {
      throw new Error('Decision number (decisionNumber) is required.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Decision title is required.');
    }
    if (!payload.content || typeof payload.content !== 'string' || payload.content.trim() === '') {
      throw new Error('Decision content / diktum is required.');
    }
    if (!payload.category || typeof payload.category !== 'string') {
      throw new Error('Decision category is required.');
    }
    if (!payload.scopeType || typeof payload.scopeType !== 'string') {
      throw new Error('Decision scopeType (RT/RW/KELURAHAN) is required.');
    }
    if (!payload.scopeId || typeof payload.scopeId !== 'string' || payload.scopeId.trim() === '') {
      throw new Error('Decision scopeId is required.');
    }
    if (!payload.effectiveDate) {
      throw new Error('Decision effectiveDate is required.');
    }

    if (this.rule) {
      if (typeof this.rule.checkValidCategory === 'function') {
        this.rule.checkValidCategory(payload.category);
      }
      if (typeof this.rule.checkValidScopeType === 'function') {
        this.rule.checkValidScopeType(payload.scopeType);
      }
      if (typeof this.rule.checkMeetingReference === 'function') {
        this.rule.checkMeetingReference(payload.meetingId);
      }
    }
  }

  /**
   * Validates the payload for updating an existing decision.
   * @param {object} payload - Update payload.
   * @param {object} [currentDecision=null] - Existing decision instance.
   * @throws {Error} If validation fails.
   */
  validateDecisionUpdate(payload, currentDecision = null) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Update payload is required.');
    }

    if (currentDecision && this.rule && typeof this.rule.checkImmutability === 'function') {
      this.rule.checkImmutability(currentDecision);
    }

    const immutableFields = ['meetingId', 'scopeId', 'scopeType', 'createdAt'];
    for (const field of immutableFields) {
      if (payload[field] !== undefined) {
        throw new Error(`Field '${field}' cannot be modified during a decision update.`);
      }
    }

    if (payload.category && this.rule && typeof this.rule.checkValidCategory === 'function') {
      this.rule.checkValidCategory(payload.category);
    }
  }

  /**
   * Validates the payload for declaring a policy impact.
   * @param {object} payload - { decisionId, targetType, targetScopeId, description }.
   * @throws {Error} If validation fails.
   */
  validateImpactAdd(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Impact payload is required.');
    }
    if (!payload.decisionId || typeof payload.decisionId !== 'string') {
      throw new Error('Decision ID is required to add policy impact.');
    }
    if (!payload.targetType || typeof payload.targetType !== 'string') {
      throw new Error('Target type is required.');
    }
    if (!payload.targetScopeId || typeof payload.targetScopeId !== 'string') {
      throw new Error('Target scope ID is required.');
    }
    if (!payload.description || typeof payload.description !== 'string' || payload.description.trim() === '') {
      throw new Error('Impact description is required.');
    }

    if (this.rule && typeof this.rule.checkValidTargetType === 'function') {
      this.rule.checkValidTargetType(payload.targetType);
    }
  }
}

module.exports = DecisionValidator;

