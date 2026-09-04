/**
 * @class HealthVisitRule
 * @description Encapsulates business rule checks for the HealthVisit package.
 */
class HealthVisitRule {
  /**
   * @param {HealthVisitRepository} healthVisitRepository
   * @param {CitizenRepository} citizenRepository
   * @param {HealthRepository} healthRepository
   */
  constructor(healthVisitRepository, citizenRepository, healthRepository) {
    /** @private */
    this.repository = healthVisitRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.healthRepository = healthRepository;
    // Other context repositories would be injected here as needed.
    /** @private */
    this.logger = WK.logger('HealthVisitRule');

    /** @private */
    this.allowedStatusTransitions = {
      'SCHEDULED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'NO_SHOW': [],
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
   * Checks for a duplicate visit for the same citizen on the same day and type.
   * @param {object} payload - The data payload.
   */
  checkDuplicateVisit(payload) {
    const { citizenId, visitDate, visitType } = payload;
    const existing = this.repository.search({ citizenId, visitDate, visitType }, { limit: 1 });
    if (existing.length > 0) {
      throw new Error(`A health visit of type '${visitType}' for citizen ${citizenId} on ${visitDate} already exists.`);
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload.
   */
  checkDates(payload) {
    const { visitDate } = payload;
    if (visitDate && new Date(visitDate) > new Date()) {
      throw new Error('Visit date cannot be in the future.');
    }
  }

  /**
   * Validates a status transition.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid health visit status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid health visit status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Checks if the visit context is valid.
   * @param {string} contextType - The type of context.
   * @param {string} contextId - The ID of the context record.
   * @param {string} citizenId - The citizen ID for ownership validation.
   */
  checkVisitContext(contextType, contextId, citizenId) {
    if (!contextType || !contextId) {
      return; // Context is optional
    }
    // In a real implementation, this would use a service locator to get the correct repository.
    // const contextRepo = WK.repository(contextType);
    // const contextRecord = contextRepo.findById(contextId);
    // if (!contextRecord) throw new Error(`${contextType} with ID ${contextId} not found.`);
    // if (contextRecord.citizenId !== citizenId) throw new Error(`${contextType} does not belong to citizen.`);
  }

  /**
   * Checks if lookup-based fields are valid against MasterData.
   * @param {object} payload - The data payload.
   */
  checkLookups(payload) {
    const masterDataService = WK.service('MasterData');
    const lookups = [
      { field: 'visitType', type: 'HEALTH_VISIT_TYPE' },
      { field: 'visitStatus', type: 'HEALTH_VISIT_STATUS' },
      { field: 'locationType', type: 'LOCATION_TYPE' },
      { field: 'providerType', type: 'PROVIDER_TYPE' },
    ];

    for (const lookup of lookups) {
      if (payload[lookup.field] && !masterDataService.exists(lookup.type, payload[lookup.field])) {
        throw new Error(`Invalid value for ${lookup.field}: '${payload[lookup.field]}'. It does not exist in master data type '${lookup.type}'.`);
      }
    }
  }
}