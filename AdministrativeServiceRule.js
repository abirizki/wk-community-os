/**
 * @class AdministrativeServiceRule
 * @description Encapsulates business rule checks for the AdministrativeService package.
 */
class AdministrativeServiceRule {
  /**
   * @param {AdministrativeServiceRepository} administrativeServiceRepository
   * @param {CitizenRepository} citizenRepository
   * @param {FamilyRepository} familyRepository
   */
  constructor(administrativeServiceRepository, citizenRepository, familyRepository) {
    /** @private */
    this.repository = administrativeServiceRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.familyRepository = familyRepository;
    /** @private */
    this.logger = WK.logger('AdministrativeServiceRule');

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['SUBMITTED', 'CANCELLED'],
      'SUBMITTED': ['RT_VERIFIED', 'REJECTED', 'CANCELLED'],
      'RT_VERIFIED': ['RW_VERIFIED', 'REJECTED', 'CANCELLED'],
      'RW_VERIFIED': ['KELURAHAN_PROCESSED', 'REJECTED', 'CANCELLED'],
      'KELURAHAN_PROCESSED': ['COMPLETED', 'REJECTED', 'CANCELLED'],
      'COMPLETED': [],
      'REJECTED': [],
      'CANCELLED': [],
    };
  }

  /**
   * Checks if the citizen exists.
   * @param {string} citizenId - The ID of the citizen.
   * @throws {Error} If the citizen does not exist.
   */
  checkCitizenExists(citizenId) {
    if (!this.citizenRepository.exists(citizenId)) {
      throw new Error(`Citizen with ID ${citizenId} not found.`);
    }
  }

  /**
   * Checks if the family exists.
   * @param {string} familyId - The ID of the family.
   * @throws {Error} If the family does not exist.
   */
  checkFamilyExists(familyId) {
    if (!this.familyRepository.exists(familyId)) {
      throw new Error(`Family with ID ${familyId} not found.`);
    }
  }

  /**
   * Checks if the citizen belongs to the specified family.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} familyId - The ID of the family.
   * @throws {Error} If the citizen is not a member of the family.
   */
  checkCitizenFamilyRelationship(citizenId, familyId) {
    const family = this.familyRepository.findById(familyId);
    if (!family || !family.members.some(member => member.citizenId === citizenId)) {
      throw new Error(`Citizen ${citizenId} is not a member of family ${familyId}.`);
    }
  }

  /**
   * Checks if the request type is valid against master data.
   * @param {string} requestType - The request type to validate.
   * @throws {Error} If the request type is invalid.
   */
  checkValidRequestType(requestType) {
    if (!WK.service('MasterData').exists('ADMIN_SERVICE_REQUEST_TYPE', requestType)) {
      throw new Error(`Invalid request type: '${requestType}'.`);
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload.
   * @throws {Error} If any date is invalid.
   */
  checkDates(payload) {
    const { requestDate, submissionDate, rtVerificationDate, rwVerificationDate, kelurahanProcessingDate } = payload;
    const now = new Date();

    if (requestDate && new Date(requestDate) > now) {
      throw new Error('Request date cannot be in the future.');
    }
    if (submissionDate && new Date(submissionDate) > now) {
      throw new Error('Submission date cannot be in the future.');
    }
    if (rtVerificationDate && new Date(rtVerificationDate) > now) {
      throw new Error('RT verification date cannot be in the future.');
    }
    if (rwVerificationDate && new Date(rwVerificationDate) > now) {
      throw new Error('RW verification date cannot be in the future.');
    }
    if (kelurahanProcessingDate && new Date(kelurahanProcessingDate) > now) {
      throw new Error('Kelurahan processing date cannot be in the future.');
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
      this.logger.warn(`Invalid administrative service status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid administrative service status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Checks if the provided RT exists in master data.
   * @param {string} rt - The RT number.
   * @throws {Error} If the RT does not exist.
   */
  checkRTExists(rt) {
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
      { field: 'priority', type: 'ADMIN_SERVICE_PRIORITY' },
      { field: 'requestStatus', type: 'ADMIN_SERVICE_STATUS' },
      { field: 'rtVerificationStatus', type: 'VERIFICATION_STATUS' },
      { field: 'rwVerificationStatus', type: 'VERIFICATION_STATUS' },
      { field: 'kelurahanProcessingStatus', type: 'PROCESSING_STATUS' },
    ];

    for (const lookup of lookups) {
      if (payload[lookup.field] && !masterDataService.exists(lookup.type, payload[lookup.field])) {
        throw new Error(`Invalid value for ${lookup.field}: '${payload[lookup.field]}'. It does not exist in master data type '${lookup.type}'.`);
      }
    }
  }
}