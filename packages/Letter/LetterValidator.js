/**
 * @file LetterValidator.js
 * @description Payload validator for the Letter (Surat Pengantar) module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { LetterConstants } = require('./LetterEntity.js');

class LetterValidator {
  /**
   * Validate payload for creating a draft letter.
   * @param {Object} payload
   */
  validateDraftCreate(payload = {}) {
    const errors = [];

    if (!payload.citizenId) errors.push('citizenId is required (NIK)');
    if (!payload.familyId) errors.push('familyId is required (No. KK)');
    if (!payload.type) {
      errors.push('type is required');
    } else if (!LetterConstants.LETTER_TYPES.includes(payload.type)) {
      errors.push(`type must be one of: [${LetterConstants.LETTER_TYPES.join(', ')}]`);
    }
    if (!payload.purpose || typeof payload.purpose !== 'string' || payload.purpose.trim().length === 0) {
      errors.push('purpose is required and must not be empty');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for letter approval at a specific tier (RT, RW, KELURAHAN).
   * @param {string} tier - 'RT', 'RW', or 'KELURAHAN'
   * @param {Object} payload
   */
  validateApproval(tier, payload = {}) {
    const errors = [];
    const validTiers = ['RT', 'RW', 'KELURAHAN'];

    if (!validTiers.includes(tier)) {
      errors.push(`Invalid approval tier '${tier}'. Allowed: [${validTiers.join(', ')}]`);
    }

    if (tier === 'KELURAHAN') {
      if (!payload.letterNumber || typeof payload.letterNumber !== 'string' || payload.letterNumber.trim().length === 0) {
        errors.push('letterNumber is required for KELURAHAN tier approval to finalize the letter');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate payload for rejecting a letter.
   * @param {Object} payload
   */
  validateRejection(payload = {}) {
    const errors = [];

    if (!payload.rejectedReason || typeof payload.rejectedReason !== 'string' || payload.rejectedReason.trim().length === 0) {
      errors.push('rejectedReason is required and cannot be empty when rejecting a letter');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { LetterValidator };

