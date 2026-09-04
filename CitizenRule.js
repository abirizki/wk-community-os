/**
 * @class CitizenRule
 * @description Encapsulates business rule checks for the Citizen package.
 */
class CitizenRule {
  /**
   * @param {CitizenRepository} citizenRepository
   */
  constructor(citizenRepository) {
    /** @private */
    this.repository = citizenRepository;
    /** @private */
    this.logger = WK.logger('CitizenRule');

    /** @private */
    this.allowedStatusTransitions = {
      'ACTIVE': ['INACTIVE', 'DECEASED'],
      'INACTIVE': ['ACTIVE'],
      'DECEASED': [],
    };
  }

  /**
   * Checks for a duplicate NIK (National Identity Number).
   * @param {string} NIK - The NIK to check.
   * @throws {Error} If a citizen with the same NIK already exists.
   */
  checkDuplicateNIK(NIK) {
    const existingCitizen = this.repository.findByNIK(NIK);
    if (existingCitizen) {
      this.logger.warn(`Attempted to create citizen with duplicate NIK: ${NIK}`);
      throw new Error(`Citizen with NIK ${NIK} already exists.`);
    }
  }

  /**
   * Checks if the NIK format is valid.
   * @param {string} NIK - The NIK to validate.
   * @throws {Error} If the NIK format is invalid.
   */
  checkValidNIKFormat(NIK) {
    // NIK in Indonesia is 16 digits. This is a basic check.
    if (!/^\d{16}$/.test(NIK)) {
      throw new Error('NIK must be a 16-digit number.');
    }
  }

  /**
   * Checks if the date of birth is valid (not in the future).
   * @param {string} dateOfBirth - The date of birth (YYYY-MM-DD).
   * @throws {Error} If the date of birth is in the future.
   */
  checkValidDateOfBirth(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    if (dob > now) {
      throw new Error('Date of birth cannot be in the future.');
    }
  }

  /**
   * Checks if the provided RT exists in master data.
   * @param {string} rt - The RT number.
   * @throws {Error} If the RT does not exist.
   */
  checkRTExists(rt) {
    // Assuming a MasterData service or repository for RT/RW exists.
    if (!WK.service('MasterData').exists('RT_NUMBER', rt)) {
      throw new Error(`RT number ${rt} not found in master data.`);
    }
  }

  /**
   * Checks if the provided RW exists in master data.
   * @param {string} rw - The RW number.
   * @throws {Error} If the RW does not exist.
   */
  checkRWExists(rw) {
    // Assuming a MasterData service or repository for RT/RW exists.
    if (!WK.service('MasterData').exists('RW_NUMBER', rw)) {
      throw new Error(`RW number ${rw} not found in master data.`);
    }
  }

  /**
   * Checks if lookup-based fields are valid against MasterData.
   * @param {object} payload - The data payload.
   */
  checkLookups(payload) {
    const masterDataService = WK.service('MasterData');
    const lookups = [
      { field: 'gender', type: 'GENDER' },
      { field: 'religion', type: 'RELIGION' },
      { field: 'educationLevel', type: 'EDUCATION_LEVEL' },
      { field: 'occupation', type: 'OCCUPATION' },
      { field: 'maritalStatus', type: 'MARITAL_STATUS' },
      { field: 'status', type: 'CITIZEN_STATUS' },
    ];

    for (const lookup of lookups) {
      if (payload[lookup.field] && !masterDataService.exists(lookup.type, payload[lookup.field])) {
        throw new Error(`Invalid value for ${lookup.field}: '${payload[lookup.field]}'. It does not exist in master data type '${lookup.type}'.`);
      }
    }
  }

  /**
   * Validates a status transition.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   * @throws {Error} If the transition is not allowed.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid citizen status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid citizen status transition from ${fromStatus} to ${toStatus}.`);
    }
  }
}