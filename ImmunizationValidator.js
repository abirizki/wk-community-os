/**
 * @class ImmunizationValidator
 * @description Provides validation logic for ImmunizationRecord data.
 */
class ImmunizationValidator {
  /**
   * @param {ImmunizationRule} immunizationRule - The business rule checker for immunization records.
   */
  constructor(immunizationRule) {
    /** @private */
    this.rule = immunizationRule;
  }

  /**
   * Validates the payload for creating a new immunization record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create an immunization record.');
    }
    if (!payload.healthProfileId) {
      throw new Error('Health Profile ID is required to create an immunization record.');
    }
    if (!payload.vaccineId) {
      throw new Error('Vaccine ID is required.');
    }
    if (!payload.doseNumber) {
      throw new Error('Dose number is required.');
    }
    if (payload.administrationStatus === 'ADMINISTERED' && !payload.administrationDate) {
      throw new Error('Administration date is required for an administered immunization.');
    }

    this.rule.checkCitizenAndHealthProfile(payload.citizenId, payload.healthProfileId);
    this.rule.checkVaccineExists(payload.vaccineId);
    this.rule.checkDuplicateRecord(payload);
    this.rule.checkDoseNumber(payload.doseNumber);
    this.rule.checkDates(payload);
  }

  /**
   * Validates the payload for updating an existing immunization record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }
    if (payload.healthProfileId) {
      throw new Error('Health Profile ID cannot be changed during an update.');
    }
    if (payload.vaccineId) {
      throw new Error('Vaccine ID cannot be changed during an update.');
    }
    if (payload.doseNumber) {
      throw new Error('Dose number cannot be changed during an update.');
    }

    if (payload.administrationStatus === 'ADMINISTERED' && !payload.administrationDate) {
      throw new Error('Administration date is required when status is ADMINISTERED.');
    }

    this.rule.checkDates(payload);
  }
}