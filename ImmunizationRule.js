/**
 * @class ImmunizationRule
 * @description Encapsulates business rule checks for the Immunization package.
 */
class ImmunizationRule {
  /**
   * @param {ImmunizationRepository} immunizationRepository
   * @param {HealthRepository} healthRepository
   * @param {CitizenRepository} citizenRepository
   */
  constructor(immunizationRepository, healthRepository, citizenRepository) {
    /** @private */
    this.immunizationRepository = immunizationRepository;
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.logger = WK.logger('ImmunizationRule');
  }

  /**
   * Checks if the citizen and health profile exist and are consistent.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} healthProfileId - The ID of the health profile.
   * @throws {Error} If validation fails.
   */
  checkCitizenAndHealthProfile(citizenId, healthProfileId) {
    const citizenExists = this.citizenRepository.exists(citizenId);
    if (!citizenExists) {
      this.logger.warn(`Attempted to create immunization record for non-existent citizen: ${citizenId}`);
      throw new Error(`Citizen with ID ${citizenId} not found.`);
    }

    const healthProfile = this.healthRepository.findById(healthProfileId);
    if (!healthProfile) {
      this.logger.warn(`Attempted to create immunization record with non-existent health profile: ${healthProfileId}`);
      throw new Error(`Health profile with ID ${healthProfileId} not found.`);
    }

    if (healthProfile.citizenId !== citizenId) {
      this.logger.error(`Health profile ${healthProfileId} does not belong to citizen ${citizenId}.`);
      throw new Error('Health profile does not belong to the specified citizen.');
    }
  }

  /**
   * Checks if the vaccine exists in the master data.
   * @param {string} vaccineId - The ID of the vaccine.
   * @throws {Error} If the vaccine is not found.
   */
  checkVaccineExists(vaccineId) {
    // Assumes a MasterData service or repository exists for vaccines.
    const vaccine = WK.service('MasterData').get('VACCINE', vaccineId);
    if (!vaccine) {
      this.logger.warn(`Attempted to create immunization record with unknown vaccine ID: ${vaccineId}`);
      throw new Error(`Vaccine with ID ${vaccineId} not found in master data.`);
    }
  }

  /**
   * Checks for a duplicate immunization record.
   * @param {object} payload - The data payload.
   * @throws {Error} If a duplicate record is found.
   */
  checkDuplicateRecord(payload) {
    const { citizenId, vaccineId, doseNumber } = payload;
    const query = { citizenId, vaccineId, doseNumber };
    const existingRecord = this.immunizationRepository.search(query, { limit: 1 });
    if (existingRecord && existingRecord.length > 0) {
      this.logger.warn(`Attempted to create duplicate immunization record for citizen ${citizenId}, vaccine ${vaccineId}, dose ${doseNumber}.`);
      throw new Error(`An immunization record for this vaccine and dose number already exists for the citizen.`);
    }
  }

  /**
   * Validates the dose number.
   * @param {number} doseNumber - The dose number.
   * @throws {Error} If the dose number is invalid.
   */
  checkDoseNumber(doseNumber) {
    if (doseNumber === undefined || doseNumber === null || doseNumber < 1) {
      throw new Error('Dose number must be a positive integer.');
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload.
   * @throws {Error} If any date is invalid.
   */
  checkDates(payload) {
    const { administrationDate, nextDoseDate } = payload;
    const now = new Date();

    if (administrationDate && new Date(administrationDate) > now) {
      throw new Error('Administration date cannot be in the future.');
    }
    if (nextDoseDate && new Date(nextDoseDate) < now) {
      throw new Error('Next dose date cannot be in the past.');
    }
  }

  /**
   * Validates the administration status.
   * @param {string} status - The status to validate.
   * @throws {Error} If the status is invalid.
   */
  checkAdministrationStatus(status) {
    const validStatuses = ['SCHEDULED', 'ADMINISTERED', 'CANCELLED', 'MISSED', 'DEFERRED', 'UNKNOWN'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      throw new Error(`Invalid administration status: ${status}.`);
    }
  }
}