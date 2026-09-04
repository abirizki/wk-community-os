/**
 * @class CitizenValidator
 * @description Provides validation logic for Citizen data.
 */
class CitizenValidator {
  /**
   * @param {CitizenRule} citizenRule - The business rule checker for citizens.
   */
  constructor(citizenRule) {
    /** @private */
    this.rule = citizenRule;
  }

  /**
   * Validates the payload for creating a new citizen record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.NIK) {
      throw new Error('NIK (National Identity Number) is required.');
    }
    if (!payload.fullName) {
      throw new Error('Full name is required.');
    }
    if (!payload.dateOfBirth) {
      throw new Error('Date of birth is required.');
    }
    if (!payload.rt) {
      throw new Error('RT (Rukun Tetangga) is required.');
    }
    if (!payload.rw) {
      throw new Error('RW (Rukun Warga) is required.');
    }

    this.rule.checkValidNIKFormat(payload.NIK);
    this.rule.checkDuplicateNIK(payload.NIK);
    this.rule.checkValidDateOfBirth(payload.dateOfBirth);
    this.rule.checkRTExists(payload.rt); // Assuming RT master data exists
    this.rule.checkRWExists(payload.rw); // Assuming RW master data exists
    this.rule.checkLookups(payload);
  }

  /**
   * Validates the payload for updating an existing citizen record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.NIK) {
      throw new Error('NIK cannot be changed during an update.');
    }
    if (payload.dateOfBirth) {
      throw new Error('Date of birth cannot be changed during an update.');
    }

    if (payload.rt) {
      this.rule.checkRTExists(payload.rt);
    }
    if (payload.rw) {
      this.rule.checkRWExists(payload.rw);
    }
    this.rule.checkLookups(payload);
  }

  /**
   * Validates the status transition.
   * @param {string} currentStatus - The current status.
   * @param {string} newStatus - The new status.
   * @throws {Error} If the transition is invalid.
   */
  validateStatusTransition(currentStatus, newStatus) {
    // This would typically delegate to a rule, but for a simple status,
    // direct validation might be acceptable if rules are minimal.
    this.rule.checkStatusTransition(currentStatus, newStatus);
  }
}