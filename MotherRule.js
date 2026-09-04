/**
 * @class MotherRule
 * @description Encapsulates business rule checks for the Mother package.
 */
class MotherRule {
  /**
   * @param {MotherRepository} motherRepository - The repository for mother profiles.
   * @param {CitizenRepository} citizenRepository - The repository for citizens.
   * @param {HealthRepository} healthRepository - The repository for health profiles.
   */
  constructor(motherRepository, citizenRepository, healthRepository) {
    /** @private */
    this.motherRepository = motherRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.logger = WK.logger('MotherRule');
  }

  /**
   * Checks if a citizen exists in the system.
   * @param {string} citizenId - The ID of the citizen to check.
   * @throws {Error} If the citizen does not exist.
   */
  checkCitizenExists(citizenId) {
    const citizenExists = this.citizenRepository.exists(citizenId);
    if (!citizenExists) {
      this.logger.warn(`Attempted to create mother profile for non-existent citizen: ${citizenId}`);
      throw new Error(`Citizen with ID ${citizenId} not found.`);
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
      this.logger.warn(`Attempted to create mother profile with non-existent health profile: ${healthProfileId}`);
      throw new Error(`Health profile with ID ${healthProfileId} not found.`);
    }
  }

  /**
   * Checks if the provided health profile belongs to the specified citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} healthProfileId - The ID of the health profile.
   * @throws {Error} If the health profile does not belong to the citizen.
   */
  checkHealthProfileBelongsToCitizen(citizenId, healthProfileId) {
    const healthProfile = this.healthRepository.findById(healthProfileId);
    if (!healthProfile || healthProfile.citizenId !== citizenId) {
      this.logger.warn(`Health profile ${healthProfileId} does not belong to citizen ${citizenId}`);
      throw new Error(`Health profile ${healthProfileId} does not belong to citizen ${citizenId}.`);
    }
  }

  /**
   * Checks if a mother profile already exists for a given citizen.
   * This enforces the one-to-one relationship between a citizen and a mother profile.
   * @param {string} citizenId - The ID of the citizen to check.
   * @throws {Error} If a profile already exists for the citizen.
   */
  checkDuplicateMotherProfile(citizenId) {
    const profileExists = this.motherRepository.exists(citizenId);
    if (profileExists) {
      this.logger.warn(`Attempted to create a duplicate mother profile for citizen: ${citizenId}`);
      throw new Error(`A mother profile already exists for citizen with ID ${citizenId}.`);
    }
  }

  /**
   * Validates maternal counter fields (pregnancies, deliveries, miscarriages, living children).
   * @param {object} payload - The data payload containing maternal counters.
   * @throws {Error} If any counter is invalid.
   */
  checkMaternalCounters(payload) {
    const { numberOfPregnancies, numberOfDeliveries, numberOfMiscarriages, numberOfLivingChildren } = payload;

    if (numberOfPregnancies !== undefined && numberOfPregnancies < 0) {
      throw new Error('Number of pregnancies cannot be negative.');
    }
    if (numberOfDeliveries !== undefined && numberOfDeliveries < 0) {
      throw new Error('Number of deliveries cannot be negative.');
    }
    if (numberOfMiscarriages !== undefined && numberOfMiscarriages < 0) {
      throw new Error('Number of miscarriages cannot be negative.');
    }
    if (numberOfLivingChildren !== undefined && numberOfLivingChildren < 0) {
      throw new Error('Number of living children cannot be negative.');
    }

    if (numberOfDeliveries !== undefined && numberOfPregnancies !== undefined && numberOfDeliveries > numberOfPregnancies) {
      throw new Error('Number of deliveries cannot exceed the number of pregnancies.');
    }
  }

  /**
   * Validates date fields.
   * @param {object} payload - The data payload containing date fields.
   * @throws {Error} If any date is invalid or in the future.
   */
  checkDates(payload) {
    const { lastMenstrualPeriod, lastDeliveryDate } = payload;
    const now = new Date();

    if (lastMenstrualPeriod && new Date(lastMenstrualPeriod) > now) {
      throw new Error('Last Menstrual Period cannot be in the future.');
    }
    if (lastDeliveryDate && new Date(lastDeliveryDate) > now) {
      throw new Error('Last Delivery Date cannot be in the future.');
    }
  }
}