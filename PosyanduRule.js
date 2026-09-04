/**
 * @class PosyanduRule
 * @description Encapsulates business rule checks for the Posyandu package.
 */
class PosyanduRule {
  /**
   * @param {PosyanduRepository} posyanduRepository
   * @param {HealthRepository} healthRepository
   */
  constructor(posyanduRepository, healthRepository) {
    /** @private */
    this.posyanduRepository = posyanduRepository;
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.logger = WK.logger('PosyanduRule');
  }

  /**
   * Checks if a citizen's health profile exists.
   * @param {string} healthProfileId - The ID of the health profile to check.
   * @throws {Error} If the health profile does not exist.
   */
  checkHealthProfileExists(healthProfileId) {
    const profile = this.healthRepository.findById(healthProfileId);
    if (!profile) {
      this.logger.warn(`Attempted to create Posyandu visit for non-existent health profile: ${healthProfileId}`);
      throw new Error(`Health profile with ID ${healthProfileId} not found.`);
    }
  }

  /**
   * Checks for a duplicate visit for the same citizen on the same day.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} visitDate - The date of the visit (YYYY-MM-DD).
   * @throws {Error} If a duplicate visit is found.
   */
  checkDuplicateVisit(citizenId, visitDate) {
    const existingVisit = this.posyanduRepository.search({ citizenId, visitDate }, { limit: 1 });
    if (existingVisit && existingVisit.length > 0) {
      this.logger.warn(`Attempted to create duplicate Posyandu visit for citizen ${citizenId} on date ${visitDate}`);
      throw new Error(`A visit record for citizen ${citizenId} on ${visitDate} already exists.`);
    }
  }

  /**
   * Checks that all measurement values in the payload are not negative.
   * @param {object} payload - The data payload containing measurements.
   * @throws {Error} If any measurement is negative.
   */
  checkMeasurements(payload) {
    const measurementFields = [
      'weight',
      'height',
      'headCircumference',
      'upperArmCircumference',
      'bodyTemperature',
    ];

    for (const field of measurementFields) {
      if (payload.hasOwnProperty(field) && payload[field] !== null && payload[field] < 0) {
        throw new Error(`Measurement '${field}' cannot be negative.`);
      }
    }

    if (payload.bloodPressure && (payload.bloodPressure.systolic < 0 || payload.bloodPressure.diastolic < 0)) {
        throw new Error('Blood pressure values cannot be negative.');
    }
  }
}