/**
 * @file ComplaintService.js
 * @description Application service orchestrating complaint workflow, rules, and event publishing.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { Complaint } = require('./ComplaintEntity.js');
const { ComplaintPermission } = require('./ComplaintPermission.js');
const { ComplaintRule } = require('./ComplaintRule.js');
const { ComplaintValidator } = require('./ComplaintValidator.js');

class ComplaintService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new ComplaintPermission();
    this.rule = new ComplaintRule();
    this.validator = new ComplaintValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ComplaintService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Submit a new citizen complaint (status: NEW).
   * @param {Object} payload - { citizenId, title, description, category, priority, location, attachments?, isAnonymous? }
   * @param {Object} context
   * @returns {Complaint}
   */
  submitComplaint(payload = {}, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateSubmit(payload);
    this.rule.checkValidCategory(payload.category);
    this.rule.checkValidPriority(payload.priority);

    const complaint = new Complaint({
      citizenId: payload.citizenId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      location: payload.location,
      attachments: payload.attachments || [],
      isAnonymous: payload.isAnonymous || false,
      status: 'NEW',
    });

    const saved = this.repository.createComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint submitted: ${saved.id} [${saved.category}/${saved.priority}] by citizen ${saved.citizenId}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintSubmitted', saved.toObject());
    }

    return saved;
  }

  /**
   * Verify complaint validity (NEW -> VERIFIED).
   * @param {string} complaintId
   * @param {Object} context
   * @returns {Complaint}
   */
  verifyComplaint(complaintId, context = {}) {
    this.permission.checkVerify(context);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'VERIFIED');

    complaint.status = 'VERIFIED';
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} verified.`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintVerified', updated.toObject());
    }

    return updated;
  }

  /**
   * Assign complaint to officer/agency (VERIFIED -> IN_PROGRESS).
   * @param {string} complaintId
   * @param {Object} payload - { assignedOfficerId }
   * @param {Object} context
   * @returns {Complaint}
   */
  assignComplaint(complaintId, payload = {}, context = {}) {
    this.permission.checkAssign(context);
    this.validator.validateAssign(payload);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'IN_PROGRESS');

    complaint.assignedOfficerId = payload.assignedOfficerId;
    complaint.status = 'IN_PROGRESS';
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} assigned to officer ${payload.assignedOfficerId}. Status: IN_PROGRESS`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintAssigned', updated.toObject());
    }

    return updated;
  }

  /**
   * Resolve complaint with evidence and notes (IN_PROGRESS -> RESOLVED).
   * @param {string} complaintId
   * @param {Object} payload - { resolutionEvidence, resolutionNotes }
   * @param {Object} context
   * @returns {Complaint}
   */
  resolveComplaint(complaintId, payload = {}, context = {}) {
    this.permission.checkResolve(context);
    this.validator.validateResolve(payload);
    this.rule.checkResolutionEvidence(payload.resolutionEvidence);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'RESOLVED');

    complaint.resolutionEvidence = payload.resolutionEvidence;
    complaint.resolutionNotes = payload.resolutionNotes;
    complaint.status = 'RESOLVED';
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} resolved with ${payload.resolutionEvidence.length} evidence attachments.`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintResolved', updated.toObject());
    }

    return updated;
  }

  /**
   * Close complaint after citizen confirmation (RESOLVED -> CLOSED).
   * @param {string} complaintId
   * @param {Object} context
   * @returns {Complaint}
   */
  closeComplaint(complaintId, context = {}) {
    this.permission.checkClose(context);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'CLOSED');

    complaint.status = 'CLOSED';
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} successfully closed.`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintClosed', updated.toObject());
    }

    return updated;
  }

  /**
   * Reject invalid complaint (NEW/VERIFIED -> REJECTED).
   * @param {string} complaintId
   * @param {Object} payload - { rejectedReason }
   * @param {Object} context
   * @returns {Complaint}
   */
  rejectComplaint(complaintId, payload = {}, context = {}) {
    this.permission.checkReject(context);
    this.validator.validateReject(payload);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'REJECTED');

    complaint.rejectedReason = payload.rejectedReason;
    complaint.status = 'REJECTED';
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} rejected. Reason: ${payload.rejectedReason}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintRejected', updated.toObject());
    }

    return updated;
  }

  /**
   * Reopen resolved complaint if citizen is not satisfied (RESOLVED -> IN_PROGRESS).
   * @param {string} complaintId
   * @param {string} reason
   * @param {Object} context
   * @returns {Complaint}
   */
  reopenComplaint(complaintId, reason = '', context = {}) {
    this.permission.checkReopen(context);

    const complaint = this.repository.findComplaintById(complaintId);
    if (!complaint) throw new Error(`Complaint not found with ID: ${complaintId}`);

    this.rule.checkTerminalStatus(complaint.status);
    this.rule.checkStatusTransition(complaint.status, 'IN_PROGRESS');

    complaint.status = 'IN_PROGRESS';
    if (reason) {
      complaint.resolutionNotes = complaint.resolutionNotes
        ? `${complaint.resolutionNotes} | [Reopened]: ${reason}`
        : `[Reopened]: ${reason}`;
    }
    const updated = this.repository.updateComplaint(complaint);

    if (this.logger && this.logger.info) {
      this.logger.info(`Complaint ${updated.id} reopened back to IN_PROGRESS. Reason: ${reason}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('ComplaintReopened', updated.toObject());
    }

    return updated;
  }
}

module.exports = { ComplaintService };

