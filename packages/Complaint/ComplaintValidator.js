/**
 * @file ComplaintValidator.js
 * @description Payload validator for the Complaint (Pengaduan Warga) module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { ComplaintConstants } = require('./ComplaintEntity.js');

class ComplaintValidator {
  /**
   * Validate payload for submitting a new citizen complaint.
   * @param {Object} payload
   */
  validateSubmit(payload = {}) {
    const errors = [];

    if (!payload.citizenId) errors.push('citizenId is required (NIK Pelapor)');
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('title is required and cannot be empty');
    }
    if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length === 0) {
      errors.push('description is required and cannot be empty');
    }
    if (!payload.category) {
      errors.push('category is required');
    } else if (!ComplaintConstants.COMPLAINT_CATEGORIES.includes(payload.category)) {
      errors.push(`category must be one of: [${ComplaintConstants.COMPLAINT_CATEGORIES.join(', ')}]`);
    }
    if (!payload.priority) {
      errors.push('priority is required');
    } else if (!ComplaintConstants.COMPLAINT_PRIORITIES.includes(payload.priority)) {
      errors.push(`priority must be one of: [${ComplaintConstants.COMPLAINT_PRIORITIES.join(', ')}]`);
    }
    if (!payload.location || typeof payload.location !== 'string' || payload.location.trim().length === 0) {
      errors.push('location is required and cannot be empty');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for assigning a complaint to an officer/agency.
   * @param {Object} payload
   */
  validateAssign(payload = {}) {
    const errors = [];

    if (!payload.assignedOfficerId || typeof payload.assignedOfficerId !== 'string' || payload.assignedOfficerId.trim().length === 0) {
      errors.push('assignedOfficerId is required when assigning a complaint');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for resolving a complaint.
   * @param {Object} payload
   */
  validateResolve(payload = {}) {
    const errors = [];

    if (!Array.isArray(payload.resolutionEvidence) || payload.resolutionEvidence.length === 0) {
      errors.push('resolutionEvidence array cannot be empty when resolving a complaint');
    }
    if (!payload.resolutionNotes || typeof payload.resolutionNotes !== 'string' || payload.resolutionNotes.trim().length === 0) {
      errors.push('resolutionNotes is required when resolving a complaint');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for rejecting a complaint.
   * @param {Object} payload
   */
  validateReject(payload = {}) {
    const errors = [];

    if (!payload.rejectedReason || typeof payload.rejectedReason !== 'string' || payload.rejectedReason.trim().length === 0) {
      errors.push('rejectedReason is required and cannot be empty when rejecting a complaint');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { ComplaintValidator };

