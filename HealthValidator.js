/**
 * @class HealthValidator
 * @description Provides validation logic for HealthProfile data.
 */
class HealthValidator {
  /**
   * @param {HealthRule} healthRule - The business rule checker for health profiles.
   */
  constructor(healthRule) {
    /** @private */
    this.rule = healthRule;
    /** @private */
    this.validBloodTypes = ['A', 'B', 'AB', 'O'];
    /** @private */
    this.validRhesusTypes = ['+', '-'];
  }

  /**
   * Validates the payload for creating a new health profile.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a health profile.');
    }

    this.rule.checkCitizenExists(payload.citizenId);
    this.rule.checkDuplicateProfile(payload.citizenId);

    this.validateBloodType(payload.bloodType, payload.rhesus);
  }

  /**
   * Validates the payload for updating an existing health profile.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.citizenId) {
      throw new Error('Citizen ID cannot be changed during an update.');
    }

    this.validateBloodType(payload.bloodType, payload.rhesus);
  }

  /**
   * Validates the blood type and rhesus factor.
   * @param {string} [bloodType] - The blood type to validate.
   * @param {string} [rhesus] - The rhesus factor to validate.
   * @throws {Error} If validation fails.
   */
  validateBloodType(bloodType, rhesus) {
    if (bloodType && !this.validBloodTypes.includes(bloodType.toUpperCase())) {
      throw new Error(`Invalid blood type: ${bloodType}. Must be one of ${this.validBloodTypes.join(', ')}.`);
    }

    if (rhesus && !this.validRhesusTypes.includes(rhesus)) {
      throw new Error(`Invalid rhesus factor: ${rhesus}. Must be one of ${this.validRhesusTypes.join(', ')}.`);
    }

    if (rhesus && !bloodType) {
      throw new Error('Rhesus factor cannot be provided without a blood type.');
    }

    if (bloodType && !rhesus) {
      throw new Error('Blood type must be provided with a rhesus factor (+ or -).');
    }
  }
}