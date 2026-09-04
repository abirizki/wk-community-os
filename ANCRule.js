/**
 * @class ANCRule
 * @description Encapsulates business rule checks for the ANC package.
 */
class ANCRule {
  /**
   * @param {ANCRepository} ancRepository
   * @param {PregnancyRepository} pregnancyRepository
   */
  constructor(ancRepository, pregnancyRepository) {
    /** @private */
    this.ancRepository = ancRepository;
    /** @private */
    this.pregnancyRepository = pregnancyRepository;
    /** @private */
    this.logger = WK.logger('ANCRule');
  }

  /**
   * Checks if a pregnancy record exists and is active.
   * @param {string} pregnancyId - The ID of the pregnancy to check.
   * @throws {Error} If the pregnancy does not exist or is not active.
   */
  checkPregnancyExistsAndIsActive(pregnancyId) {
    const pregnancy = this.pregnancyRepository.findById(pregnancyId);
    if (!pregnancy) {
      this.logger.warn(`Attempted to create ANC record for non-existent pregnancy: ${pregnancyId}`);
      throw new Error(`Pregnancy with ID ${pregnancyId} not found.`);
    }
    if (pregnancy.status !== 'ACTIVE') {
      this.logger.warn(`Attempted to create ANC record for a non-active pregnancy: ${pregnancyId} (Status: ${pregnancy.status})`);
      throw new Error(`ANC records can only be created for active pregnancies. Current status is ${pregnancy.status}.`);
    }
  }

  /**
   * Checks if the provided IDs for pregnancy, mother, citizen, and health profile are consistent.
   * @param {string} pregnancyId
   * @param {string} motherId
   * @param {string} citizenId
   * @param {string} healthProfileId
   * @throws {Error} If relationships are inconsistent.
   */
  checkRelationshipIntegrity(pregnancyId, motherId, citizenId, healthProfileId) {
    const pregnancy = this.pregnancyRepository.findById(pregnancyId);
    if (pregnancy.motherId !== motherId || pregnancy.citizenId !== citizenId || pregnancy.healthProfileId !== healthProfileId) {
      this.logger.error(`Inconsistent IDs provided for ANC record creation against pregnancy ${pregnancyId}.`);
      throw new Error('Provided IDs for mother, citizen, or health profile do not match the parent pregnancy record.');
    }
  }

  /**
   * Checks for a duplicate visit for the same pregnancy and visit number.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @param {number} visitNumber - The visit number.
   * @throws {Error} If a duplicate visit is found.
   */
  checkDuplicateVisit(pregnancyId, visitNumber) {
    const existingVisit = this.ancRepository.findByVisitNumber(pregnancyId, visitNumber);
    if (existingVisit) {
      this.logger.warn(`Attempted to create duplicate ANC visit #${visitNumber} for pregnancy ${pregnancyId}`);
      throw new Error(`An ANC record with visit number ${visitNumber} already exists for this pregnancy.`);
    }
  }

  /**
   * Validates the visit number.
   * @param {number} visitNumber - The visit number.
   * @throws {Error} If the visit number is invalid.
   */
  checkVisitNumber(visitNumber) {
    if (visitNumber === undefined || visitNumber === null || visitNumber < 1) {
      throw new Error('Visit number must be a positive integer.');
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload.
   * @throws {Error} If any date is invalid.
   */
  checkDates(payload) {
    const { visitDate, nextVisitDate } = payload;
    const now = new Date();

    if (visitDate && new Date(visitDate) > now) {
      throw new Error('Visit date cannot be in the future.');
    }
    if (nextVisitDate && new Date(nextVisitDate) < now) {
      throw new Error('Next visit date cannot be in the past.');
    }
  }

  /**
   * Validates measurement fields.
   * @param {object} payload - The data payload.
   * @throws {Error} If any measurement is invalid.
   */
  checkMeasurements(payload) {
    const fields = ['weight', 'height', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'pulseRate', 'temperature', 'fundalHeight', 'fetalHeartRate'];
    for (const field of fields) {
      if (payload.hasOwnProperty(field) && payload[field] !== null && payload[field] < 0) {
        throw new Error(`Measurement '${field}' cannot be negative.`);
      }
    }
  }

  /**
   * Validates gestational age.
   * @param {number} gestationalAgeWeeks - The gestational age in weeks.
   * @throws {Error} If the gestational age is invalid.
   */
  checkGestationalAge(gestationalAgeWeeks) {
    if (gestationalAgeWeeks !== undefined && gestationalAgeWeeks !== null) {
      if (gestationalAgeWeeks < 0) {
        throw new Error('Gestational age cannot be negative.');
      }
      if (gestationalAgeWeeks > 50) { // A reasonable sanity check
        throw new Error('Gestational age seems unreasonably high.');
      }
    }
  }
}