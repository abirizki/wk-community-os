/**
 * @class MotherValidator
 * @description Provides validation logic for MotherProfile data.
 */
class MotherValidator {
  /**
   * @param {MotherRule} motherRule - The business rule checker for mother profiles.
   */
  constructor(motherRule) {
    /** @private */
    this.rule = motherRule;
    /** @private */
    this.validBloodTypes = ['A', 'B', 'AB', 'O'];
    /** @private */
    this.validRhesusTypes = ['+', '-'];
  }

  /**
   * Validates the payload for creating a new mother profile.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a mother profile.');
    }
    if (!payload.healthProfileId) {
      throw new Error('Health Profile ID is required to create a mother profile.');
    }

    this.rule.checkCitizenExists(payload.citizenId);
    this.rule.checkHealthProfileExists(payload.healthProfileId);
    this.rule.checkHealthProfileBelongsToCitizen(payload.citizenId, payload.healthProfileId);
    this.rule.checkDuplicateMotherProfile(payload.citizenId);

    this.validateBloodType(payload.bloodType, payload.rhesus);
    this.rule.checkMaternalCounters(payload);
    this.rule.checkDates(payload);
  }

  /**
   * Validates the payload for updating an existing mother profile.
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

    this.validateBloodType(payload.bloodType, payload.rhesus);
    this.rule.checkMaternalCounters(payload);
    this.rule.checkDates(payload);
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

    // If one is provided, the other must also be provided.
    if (rhesus && !bloodType) {
      throw new Error('Rhesus factor cannot be provided without a blood type.');
    }

    if (bloodType && !rhesus) {
      throw new Error('Blood type must be provided with a rhesus factor (+ or -).');
    }
  }
}