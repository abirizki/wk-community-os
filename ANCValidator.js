/**
 * @class ANCValidator
 * @description Provides validation logic for ANCRecord data.
 */
class ANCValidator {
  /**
   * @param {ANCRule} ancRule - The business rule checker for ANC records.
   */
  constructor(ancRule) {
    /** @private */
    this.rule = ancRule;
  }

  /**
   * Validates the payload for creating a new ANC record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.pregnancyId) {
      throw new Error('Pregnancy ID is required to create an ANC record.');
    }
    if (!payload.visitDate) {
      throw new Error('Visit date is required for an ANC record.');
    }
    if (!payload.visitNumber) {
      throw new Error('Visit number is required for an ANC record.');
    }

    this.rule.checkPregnancyExistsAndIsActive(payload.pregnancyId);
    this.rule.checkRelationshipIntegrity(payload.pregnancyId, payload.motherId, payload.citizenId, payload.healthProfileId);
    this.rule.checkDuplicateVisit(payload.pregnancyId, payload.visitNumber);
    this.rule.checkVisitNumber(payload.visitNumber);
    this.rule.checkDates(payload);
    this.rule.checkMeasurements(payload);
    this.rule.checkGestationalAge(payload.gestationalAgeWeeks);
  }

  /**
   * Validates the payload for updating an existing ANC record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.pregnancyId) {
      throw new Error('Pregnancy ID cannot be changed during an update.');
    }
    if (payload.motherId) {
      throw new Error('Mother ID cannot be changed during an update.');
    }
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }
    if (payload.healthProfileId) {
      throw new Error('Health Profile ID cannot be changed during an update.');
    }
    if (payload.visitNumber) {
      throw new Error('Visit number cannot be changed during an update.');
    }
    if (payload.visitDate) {
      throw new Error('Visit date cannot be changed during an update.');
    }

    this.rule.checkDates(payload);
    this.rule.checkMeasurements(payload);
    this.rule.checkGestationalAge(payload.gestationalAgeWeeks);
  }
}