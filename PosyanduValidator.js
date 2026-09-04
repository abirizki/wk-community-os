/**
 * @class PosyanduValidator
 * @description Provides validation logic for PosyanduVisit data.
 */
class PosyanduValidator {
  /**
   * @param {PosyanduRule} posyanduRule - The business rule checker for Posyandu visits.
   */
  constructor(posyanduRule) {
    /** @private */
    this.rule = posyanduRule;
  }

  /**
   * Validates the payload for creating a new Posyandu visit.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required for a Posyandu visit.');
    }
    if (!payload.healthProfileId) {
      throw new Error('Health Profile ID is required for a Posyandu visit.');
    }
    if (!payload.visitDate) {
      throw new Error('Visit date is required.');
    }

    this.rule.checkHealthProfileExists(payload.healthProfileId);
    this.rule.checkDuplicateVisit(payload.citizenId, payload.visitDate);
    this.rule.checkMeasurements(payload);
  }

  /**
   * Validates the payload for updating an existing Posyandu visit.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }
    if (payload.visitDate) {
      throw new Error('Visit date cannot be changed during an update.');
    }

    this.rule.checkMeasurements(payload);
  }
}