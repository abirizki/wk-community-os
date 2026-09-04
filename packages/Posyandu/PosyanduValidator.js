/**
 * @file PosyanduValidator.js
 * @description Payload validator for the Posyandu module.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduConstants } = require('./PosyanduEntity.js');

class PosyanduValidator {
  /**
   * Validate member registration payload.
   * @param {Object} payload
   */
  validateMemberRegistration(payload = {}) {
    const errors = [];

    if (!payload.citizenId) errors.push('citizenId is required (NIK Peserta)');
    if (!payload.targetGroup) {
      errors.push('targetGroup is required');
    } else if (!PosyanduConstants.TARGET_GROUPS.includes(payload.targetGroup)) {
      errors.push(`targetGroup must be one of: [${PosyanduConstants.TARGET_GROUPS.join(', ')}]`);
    }

    if (!payload.posyanduName || typeof payload.posyanduName !== 'string' || payload.posyanduName.trim().length === 0) {
      errors.push('posyanduName is required and cannot be empty');
    }

    if (!payload.dateOfBirth) errors.push('dateOfBirth is required');
    if (!payload.gender || !['L', 'P'].includes(payload.gender)) {
      errors.push('gender is required and must be either "L" or "P"');
    }

    // Balita strictly requires parent citizen ID
    if (payload.targetGroup === 'BALITA' && !payload.parentCitizenId) {
      errors.push('parentCitizenId is required for BALITA target group');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate posyandu visit record submission payload.
   * @param {Object} payload
   */
  validateRecordSubmission(payload = {}) {
    const errors = [];

    if (!payload.memberId) errors.push('memberId is required');
    if (!payload.visitDate) errors.push('visitDate is required');

    if (payload.weightKg === undefined || payload.weightKg === null || Number(payload.weightKg) <= 0) {
      errors.push('weightKg must be a positive number');
    }

    if (payload.heightCm === undefined || payload.heightCm === null || Number(payload.heightCm) <= 0) {
      errors.push('heightCm must be a positive number');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { PosyanduValidator };

