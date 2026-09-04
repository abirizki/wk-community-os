/**
 * @file LetterService.js
 * @description Application service orchestrating business rules, permissions, and workflow for Letter module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { Letter } = require('./LetterEntity.js');
const { LetterPermission } = require('./LetterPermission.js');
const { LetterRule } = require('./LetterRule.js');
const { LetterValidator } = require('./LetterValidator.js');

class LetterService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new LetterPermission();
    this.rule = new LetterRule();
    this.validator = new LetterValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('LetterService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Create a new draft letter.
   * @param {Object} payload - { citizenId, familyId, type, purpose, attachments? }
   * @param {Object} context
   * @returns {Letter}
   */
  draftLetter(payload = {}, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateDraftCreate(payload);
    this.rule.checkValidLetterType(payload.type);

    const letter = new Letter({
      citizenId: payload.citizenId,
      familyId: payload.familyId,
      type: payload.type,
      purpose: payload.purpose,
      attachments: payload.attachments || [],
      status: 'DRAFT',
    });

    const saved = this.repository.createLetter(letter);

    if (this.logger && this.logger.info) {
      this.logger.info(`Letter drafted: ${saved.id} (${saved.type}) for citizen ${saved.citizenId}`);
    }

    return saved;
  }

  /**
   * Submit draft letter for RT approval (validates required attachments).
   * @param {string} letterId
   * @param {Object} context
   * @returns {Letter}
   */
  submitLetter(letterId, context = {}) {
    this.permission.checkCreate(context);

    const letter = this.repository.findLetterById(letterId);
    if (!letter) throw new Error(`Letter not found with ID: ${letterId}`);

    this.rule.checkTerminalStatus(letter.status);
    this.rule.checkStatusTransition(letter.status, 'WAITING_RT');
    this.rule.checkAttachmentsCompleteness(letter.type, letter.attachments);

    letter.status = 'WAITING_RT';
    const updated = this.repository.updateLetter(letter);

    if (this.logger && this.logger.info) {
      this.logger.info(`Letter submitted for RT approval: ${updated.id}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('LetterSubmitted', updated.toObject());
    }

    return updated;
  }

  /**
   * Multi-tiered letter approval (RT -> RW -> KELURAHAN).
   * @param {string} letterId
   * @param {string} approverId
   * @param {string} tier - 'RT' | 'RW' | 'KELURAHAN'
   * @param {Object} payload - { letterNumber? } (required for KELURAHAN tier)
   * @param {Object} context
   * @returns {Letter}
   */
  approveLetter(letterId, approverId, tier, payload = {}, context = {}) {
    // 1. RBAC check per tier
    if (tier === 'RT') {
      this.permission.checkApproveRt(context);
    } else if (tier === 'RW') {
      this.permission.checkApproveRw(context);
    } else if (tier === 'KELURAHAN') {
      this.permission.checkApproveKelurahan(context);
    }

    // 2. Validate approval payload
    this.validator.validateApproval(tier, payload);

    const letter = this.repository.findLetterById(letterId);
    if (!letter) throw new Error(`Letter not found with ID: ${letterId}`);

    // 3. Prevent modification of terminal letters
    this.rule.checkTerminalStatus(letter.status);

    // 4. Determine next status and update approval trail
    let nextStatus;
    if (tier === 'RT') {
      nextStatus = 'WAITING_RW';
      letter.approvedByRtId = approverId;
    } else if (tier === 'RW') {
      nextStatus = 'WAITING_KELURAHAN';
      letter.approvedByRwId = approverId;
    } else if (tier === 'KELURAHAN') {
      nextStatus = 'APPROVED';
      letter.approvedByKelId = approverId;
      letter.letterNumber = payload.letterNumber;
    }

    // 5. Enforce workflow transition rules
    this.rule.checkStatusTransition(letter.status, nextStatus);
    letter.status = nextStatus;

    const updated = this.repository.updateLetter(letter);

    if (this.logger && this.logger.info) {
      this.logger.info(`Letter ${updated.id} approved at tier ${tier} by ${approverId} -> status: ${updated.status}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('LetterApproved', { tier, letter: updated.toObject() });
    }

    return updated;
  }

  /**
   * Reject letter at any stage of the workflow.
   * @param {string} letterId
   * @param {string} approverId
   * @param {string} reason
   * @param {Object} context
   * @returns {Letter}
   */
  rejectLetter(letterId, approverId, reason, context = {}) {
    this.permission.checkReject(context);
    this.validator.validateRejection({ rejectedReason: reason });

    const letter = this.repository.findLetterById(letterId);
    if (!letter) throw new Error(`Letter not found with ID: ${letterId}`);

    this.rule.checkTerminalStatus(letter.status);
    this.rule.checkStatusTransition(letter.status, 'REJECTED');

    letter.status = 'REJECTED';
    letter.rejectedReason = reason;

    const updated = this.repository.updateLetter(letter);

    if (this.logger && this.logger.info) {
      this.logger.info(`Letter ${updated.id} rejected by ${approverId}. Reason: ${reason}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('LetterRejected', { letter: updated.toObject(), rejectedBy: approverId, reason });
    }

    return updated;
  }
}

module.exports = { LetterService };

