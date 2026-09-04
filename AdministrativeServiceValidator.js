/**
 * @class AdministrativeServiceValidator
 * @description Provides validation logic for AdministrativeService data.
 */
class AdministrativeServiceValidator {
  /**
   * @param {AdministrativeServiceRule} administrativeServiceRule - The business rule checker.
   */
  constructor(administrativeServiceRule) {
    /** @private */
    this.rule = administrativeServiceRule;
  }

  /**
   * Validates the payload for creating a new administrative service request.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required for an administrative service request.');
    }
    if (!payload.requestType) {
      throw new Error('Request type is required for an administrative service request.');
    }
    if (!payload.requestDate) {
      throw new Error('Request date is required for an administrative service request.');
    }
    if (!payload.rt) {
      throw new Error('RT (Rukun Tetangga) is required for an administrative service request.');
    }
    if (!payload.rw) {
      throw new Error('RW (Rukun Warga) is required for an administrative service request.');
    }

    this.rule.checkCitizenExists(payload.citizenId);
    if (payload.familyId) {
      this.rule.checkFamilyExists(payload.familyId);
      this.rule.checkCitizenFamilyRelationship(payload.citizenId, payload.familyId);
    }
    this.rule.checkValidRequestType(payload.requestType);
    this.rule.checkDates(payload);
    this.rule.checkRTExists(payload.rt);
    this.rule.checkRWExists(payload.rw);
    this.rule.checkLookups(payload);
  }

  /**
   * Validates the payload for updating an existing administrative service request.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }
    if (payload.requestType) {
      throw new Error('Request type cannot be changed during an update.');
    }
    if (payload.requestDate) {
      throw new Error('Request date cannot be changed during an update.');
    }

    if (payload.rt) {
      this.rule.checkRTExists(payload.rt);
    }
    if (payload.rw) {
      this.rule.checkRWExists(payload.rw);
    }
    this.rule.checkLookups(payload);
  }
}