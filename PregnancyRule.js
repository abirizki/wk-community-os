/**
 * @class PregnancyRule
 * @description Encapsulates business rule checks for the Pregnancy package.
 */
class PregnancyRule {
  /**
   * @param {PregnancyRepository} pregnancyRepository - The repository for pregnancy records.
   * @param {MotherRepository} motherRepository - The repository for mother profiles.
   * @param {HealthRepository} healthRepository - The repository for health profiles.
   * @param {CitizenRepository} citizenRepository - The repository for citizens.
   */
  constructor(pregnancyRepository, motherRepository, healthRepository, citizenRepository) {
    /** @private */
    this.pregnancyRepository = pregnancyRepository;
    /** @private */
    this.motherRepository = motherRepository;
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.logger = WK.logger('PregnancyRule');

    /** @private */
    this.allowedStatusTransitions = {
      'PLANNED': ['ACTIVE', 'ENDED'],
      'ACTIVE': ['COMPLETED', 'ENDED'],
      'COMPLETED': [],
      'ENDED': [],
      'UNKNOWN': ['PLANNED', 'ACTIVE', 'COMPLETED', 'ENDED'],
    };
  }

  /**
   * Checks if a mother profile exists in the system.
   * @param {string} motherId - The ID of the mother profile to check.
   * @throws {Error} If the mother profile does not exist.
   */
  checkMotherExists(motherId) {
    const motherExists = this.motherRepository.exists(motherId);
    if (!motherExists) {
      this.logger.warn(`Attempted to create pregnancy for non-existent mother: ${motherId}`);
      throw new Error(`Mother profile with ID ${motherId} not found.`);
    }
  }

  /**
   * Checks if a health profile exists in the system.
   * @param {string} healthProfileId - The ID of the health profile to check.
   * @throws {Error} If the health profile does not exist.
   */
  checkHealthProfileExists(healthProfileId) {
    const profile = this.healthRepository.findById(healthProfileId);
    if (!profile) {
      this.logger.warn(`Attempted to create pregnancy with non-existent health profile: ${healthProfileId}`);
      throw new Error(`Health profile with ID ${healthProfileId} not found.`);
    }
  }

  /**
   * Checks if the provided mother, health profile, and citizen IDs are consistent.
   * @param {string} motherId - The ID of the mother profile.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} healthProfileId - The ID of the health profile.
   * @throws {Error} If the relationships are inconsistent.
   */
  checkMotherHealthCitizenRelationship(motherId, citizenId, healthProfileId) {
    const motherProfile = this.motherRepository.findById(motherId);
    if (!motherProfile || motherProfile.citizenId !== citizenId) {
      this.logger.warn(`Mother profile ${motherId} does not belong to citizen ${citizenId}`);
      throw new Error(`Mother profile ${motherId} does not belong to citizen ${citizenId}.`);
    }

    const healthProfile = this.healthRepository.findById(healthProfileId);
    if (!healthProfile || healthProfile.citizenId !== citizenId) {
      this.logger.warn(`Health profile ${healthProfileId} does not belong to citizen ${citizenId}`);
      throw new Error(`Health profile ${healthProfileId} does not belong to citizen ${citizenId}.`);
    }
  }

  /**
   * Checks if an active pregnancy already exists for a given mother.
   * @param {string} motherId - The ID of the mother.
   * @param {string|null} [excludePregnancyId=null] - An optional pregnancy ID to exclude from the check.
   * @throws {Error} If an active pregnancy already exists.
   */
  checkActivePregnancyExists(motherId, excludePregnancyId = null) {
    const activePregnancy = this.pregnancyRepository.activePregnancyExists(motherId, excludePregnancyId);
    if (activePregnancy) {
      this.logger.warn(`Attempted to create/activate a duplicate active pregnancy for mother: ${motherId}`);
      throw new Error(`An active pregnancy already exists for mother with ID ${motherId}.`);
    }
  }

  /**
   * Validates the pregnancy number.
   * @param {string} motherId - The ID of the mother.
   * @param {number} pregnancyNumber - The proposed pregnancy number.
   * @throws {Error} If the pregnancy number is invalid.
   */
  checkPregnancyNumber(motherId, pregnancyNumber) {
    if (pregnancyNumber === undefined || pregnancyNumber === null || pregnancyNumber < 1) {
      throw new Error('Pregnancy number must be a positive integer.');
    }
    // This rule could be extended to check against the mother's existing pregnancy history
    // to ensure it's sequential or not skipping numbers, if such a business rule exists.
  }

  /**
   * Validates date fields for consistency.
   * @param {object} payload - The data payload containing date fields.
   * @throws {Error} If any date is invalid or inconsistent.
   */
  checkDates(payload) {
    const { startDate, estimatedDueDate, actualEndDate } = payload;
    const now = new Date();

    if (startDate && new Date(startDate) > now) {
      throw new Error('Start date cannot be in the future.');
    }
    if (estimatedDueDate && new Date(estimatedDueDate) < new Date(startDate)) {
      throw new Error('Estimated Due Date cannot be before Start Date.');
    }
    if (actualEndDate && new Date(actualEndDate) < new Date(startDate)) {
      throw new Error('Actual End Date cannot be before Start Date.');
    }
    if (actualEndDate && new Date(actualEndDate) > now) {
      throw new Error('Actual End Date cannot be in the future.');
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
      // Example: Max gestational age could be configured, e.g., 42 weeks for a full-term pregnancy.
      // if (gestationalAgeWeeks > WK.config().get('pregnancy.maxGestationalAgeWeeks', 42)) {
      //   throw new Error('Gestational age exceeds maximum allowed.');
      // }
    }
  }

  /**
   * Validates allowed state transitions for pregnancy status.
   * @param {string} currentStatus - The current status of the pregnancy.
   * @param {string} newStatus - The proposed new status.
   * @throws {Error} If the transition is not allowed.
   */
  checkStateTransition(currentStatus, newStatus) {
    if (!this.allowedStatusTransitions[currentStatus] || !this.allowedStatusTransitions[currentStatus].includes(newStatus)) {
      this.logger.warn(`Invalid pregnancy status transition from ${currentStatus} to ${newStatus}`);
      throw new Error(`Invalid pregnancy status transition from ${currentStatus} to ${newStatus}.`);
    }
  }

  /**
   * Validates maternal counter fields (gravida, para, abortus, livingChildren).
   * @param {object} payload - The data payload containing maternal counters.
   * @throws {Error} If any counter is invalid.
   */
  checkMaternalCounters(payload) {
    const { gravida, para, abortus, livingChildren } = payload;

    if (gravida !== undefined && gravida !== null && gravida < 0) {
      throw new Error('Gravida (number of pregnancies) cannot be negative.');
    }
    if (para !== undefined && para !== null && para < 0) {
      throw new Error('Para (number of live births) cannot be negative.');
    }
    if (abortus !== undefined && abortus !== null && abortus < 0) {
      throw new Error('Abortus (number of miscarriages/abortions) cannot be negative.');
    }
    if (livingChildren !== undefined && livingChildren !== null && livingChildren < 0) {
      throw new Error('Number of living children cannot be negative.');
    }

    // Example: More complex rules could be added, e.g., para + abortus <= gravida
    if (gravida !== undefined && para !== undefined && abortus !== undefined && (para + abortus > gravida)) {
      throw new Error('Sum of live births and miscarriages cannot exceed total pregnancies (gravida).');
    }
  }
}