/**
 * @class PregnancyValidator
 * @description Provides validation logic for Pregnancy data.
 */
class PregnancyValidator {
  /**
   * @param {PregnancyRule} pregnancyRule - The business rule checker for pregnancy profiles.
   */
  constructor(pregnancyRule) {
    /** @private */
    this.rule = pregnancyRule;
    /** @private */
    this.validStatuses = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ENDED', 'UNKNOWN'];
    /** @private */
    this.validOutcomes = ['LIVE_BIRTH', 'STILLBIRTH', 'MISCARRIAGE', 'TERMINATION', 'UNKNOWN'];
    /** @private */
    this.validRiskStatuses = ['NORMAL', 'MONITORING', 'HIGH_RISK', 'UNKNOWN'];
  }

  /**
   * Validates the payload for creating a new pregnancy record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.motherId) {
      throw new Error('Mother ID is required to create a pregnancy record.');
    }
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a pregnancy record.');
    }
    if (!payload.healthProfileId) {
      throw new Error('Health Profile ID is required to create a pregnancy record.');
    }
    if (!payload.startDate) {
      throw new Error('Start date is required for a pregnancy record.');
    }

    this.rule.checkMotherExists(payload.motherId);
    this.rule.checkHealthProfileExists(payload.healthProfileId);
    this.rule.checkMotherHealthCitizenRelationship(payload.motherId, payload.citizenId, payload.healthProfileId);
    this.rule.checkActivePregnancyExists(payload.motherId); // No excludeId for create
    this.rule.checkPregnancyNumber(payload.motherId, payload.pregnancyNumber);

    this.validateStatus(payload.status);
    this.validateRiskStatus(payload.riskStatus);
    this.rule.checkDates(payload);
    this.rule.checkGestationalAge(payload.gestationalAgeWeeks);
    this.rule.checkMaternalCounters(payload);
  }

  /**
   * Validates the payload for updating an existing pregnancy record.
   * @param {string} pregnancyId - The ID of the pregnancy being updated.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(pregnancyId, payload) {
    if (payload.motherId) {
      throw new Error('Mother ID cannot be changed during an update.');
    }
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }
    if (payload.healthProfileId) {
      throw new Error('Health Profile ID cannot be changed during an update.');
    }
    if (payload.pregnancyNumber) {
      throw new Error('Pregnancy number cannot be changed during an update.');
    }

    if (payload.status) {
      this.validateStatus(payload.status);
      // Rule for state transitions will be checked in the service layer
    }
    if (payload.riskStatus) {
      this.validateRiskStatus(payload.riskStatus);
    }
    if (payload.pregnancyOutcome) {
      this.validateOutcome(payload.pregnancyOutcome);
    }

    this.rule.checkDates(payload);
    this.rule.checkGestationalAge(payload.gestationalAgeWeeks);
    this.rule.checkMaternalCounters(payload);
  }

  /**
   * Validates a pregnancy status.
   * @param {string} status - The status to validate.
   * @throws {Error} If the status is invalid.
   */
  validateStatus(status) {
    if (status && !this.validStatuses.includes(status.toUpperCase())) {
      throw new Error(`Invalid pregnancy status: ${status}. Must be one of ${this.validStatuses.join(', ')}.`);
    }
  }

  /**
   * Validates a pregnancy outcome.
   * @param {string} outcome - The outcome to validate.
   * @throws {Error} If the outcome is invalid.
   */
  validateOutcome(outcome) {
    if (outcome && !this.validOutcomes.includes(outcome.toUpperCase())) {
      throw new Error(`Invalid pregnancy outcome: ${outcome}. Must be one of ${this.validOutcomes.join(', ')}.`);
    }
  }

  /**
   * Validates a maternal risk status.
   * @param {string} riskStatus - The risk status to validate.
   * @throws {Error} If the risk status is invalid.
   */
  validateRiskStatus(riskStatus) {
    if (riskStatus && !this.validRiskStatuses.includes(riskStatus.toUpperCase())) {
      throw new Error(`Invalid maternal risk status: ${riskStatus}. Must be one of ${this.validRiskStatuses.join(', ')}.`);
    }
  }
}