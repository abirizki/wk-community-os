/**
 * @class ReferralRule
 * @description Encapsulates business rule checks for the Referral package.
 */
class ReferralRule {
  /**
   * @param {ReferralRepository} referralRepository
   * @param {CitizenRepository} citizenRepository
   * @param {HealthRepository} healthRepository
   * @param {MedicalRecordRepository} medicalRecordRepository
   */
  constructor(referralRepository, citizenRepository, healthRepository, medicalRecordRepository) {
    /** @private */
    this.referralRepository = referralRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.medicalRecordRepository = medicalRecordRepository;
    // Other repositories (ANC, Pregnancy, etc.) would be injected here as needed.
    /** @private */
    this.logger = WK.logger('ReferralRule');

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['PENDING', 'CANCELLED'],
      'PENDING': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'REJECTED': [],
      'CANCELLED': [],
      'EXPIRED': [],
    };
  }

  /**
   * Checks if the citizen and health profile exist and are consistent.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} [healthProfileId] - The optional ID of the health profile.
   */
  checkCitizenAndHealthProfile(citizenId, healthProfileId) {
    if (!this.citizenRepository.exists(citizenId)) {
      throw new Error(`Citizen with ID ${citizenId} not found.`);
    }
    if (healthProfileId) {
      const healthProfile = this.healthRepository.findById(healthProfileId);
      if (!healthProfile) {
        throw new Error(`Health profile with ID ${healthProfileId} not found.`);
      }
      if (healthProfile.citizenId !== citizenId) {
        throw new Error('Health profile does not belong to the specified citizen.');
      }
    }
  }

  /**
   * Checks if the source context entity exists and belongs to the citizen.
   * @param {string} sourceType - The type of the source entity.
   * @param {string} sourceId - The ID of the source entity.
   * @param {string} citizenId - The ID of the citizen.
   */
  checkSourceContext(sourceType, sourceId, citizenId) {
    let sourceRecord;
    switch (sourceType) {
      case 'MEDICAL_RECORD':
        sourceRecord = this.medicalRecordRepository.findById(sourceId);
        break;
      // Add cases for 'ANC_RECORD', 'POSYANDU_VISIT', etc.
      default:
        throw new Error(`Unsupported referral source type: ${sourceType}`);
    }

    if (!sourceRecord) {
      throw new Error(`Source record of type ${sourceType} with ID ${sourceId} not found.`);
    }
    if (sourceRecord.citizenId !== citizenId) {
      throw new Error(`Source record does not belong to citizen ${citizenId}.`);
    }
  }

  /**
   * Checks if the destination is valid.
   * @param {string} destinationType - The type of destination.
   * @param {string} destinationId - The ID of the destination from MasterData.
   */
  checkDestination(destinationType, destinationId) {
    const destination = WK.service('MasterData').get(destinationType, destinationId);
    if (!destination) {
      throw new Error(`Destination of type ${destinationType} with ID ${destinationId} not found in master data.`);
    }
  }

  /**
   * Checks if the provider is valid.
   * @param {string} providerId - The ID of the provider.
   */
  checkProvider(providerId) {
    // Assumes a global provider service/registry exists.
    if (providerId && !WK.service('ProviderRegistry').exists(providerId)) {
      throw new Error(`Referring provider with ID ${providerId} not found.`);
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload.
   */
  checkDates(payload) {
    const { referralDate, followUpDate } = payload;
    const now = new Date();
    if (referralDate && new Date(referralDate) > now) {
      throw new Error('Referral date cannot be in the future.');
    }
    if (followUpDate && new Date(followUpDate) < new Date(referralDate || now)) {
      throw new Error('Follow-up date cannot be in the past or before the referral date.');
    }
  }

  /**
   * Validates a status transition.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid referral status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid referral status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Validates a referral status against master data.
   * @param {string} status - The status to check.
   */
  checkStatus(status) {
    if (status && !WK.service('MasterData').exists('REFERRAL_STATUS', status)) {
      throw new Error(`Invalid referral status: ${status}.`);
    }
  }

  // Similar checks for checkType, checkPriority would exist here, checking against MasterData.
  checkType(type) { /* ... */ }
  checkPriority(priority) { /* ... */ }
}