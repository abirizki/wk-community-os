/**
 * @class HealthVisitValidator
 * @description Provides validation logic for HealthVisit data.
 */
class HealthVisitValidator {
  /**
   * @param {HealthVisitRule} healthVisitRule - The business rule checker for health visits.
   */
  constructor(healthVisitRule) {
    /** @private */
    this.rule = healthVisitRule;
  }

  /**
   * Validates the payload for creating a new health visit.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a health visit.');
    }
    if (!payload.visitDate) {
      throw new Error('Visit date is required.');
    }
    if (!payload.visitType) {
      throw new Error('Visit type is required.');
    }

    this.rule.checkCitizenAndHealthProfile(payload.citizenId, payload.healthProfileId);
    this.rule.checkDuplicateVisit(payload);
    this.rule.checkDates(payload);
    this.rule.checkVisitContext(payload.visitContextType, payload.visitContextId, payload.citizenId);
    this.rule.checkLookups(payload);
  }

  /**
   * Validates the payload for updating an existing health visit.
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

    this.rule.checkDates(payload);
    this.rule.checkLookups(payload);
  }
}