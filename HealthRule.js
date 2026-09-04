/**
 * @class HealthRule
 * @description Encapsulates business rule checks for the Health package.
 */
class HealthRule {
  /**
   * @param {HealthRepository} healthRepository - The repository for health profiles.
   * @param {CitizenRepository} citizenRepository - The repository for citizens.
   */
  constructor(healthRepository, citizenRepository) {
    /** @private */
    this.healthRepository = healthRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
  }

  /**
   * Checks if a citizen exists in the system.
   * @param {string} citizenId - The ID of the citizen to check.
   * @throws {Error} If the citizen does not exist.
   */
  checkCitizenExists(citizenId) {
    const citizenExists = this.citizenRepository.exists(citizenId);
    if (!citizenExists) {
      WK.logger().warn(`Attempted to create health profile for non-existent citizen: ${citizenId}`, 'HealthRule');
      throw new Error(`Citizen with ID ${citizenId} not found.`);
    }
  }

  /**
   * Checks if a health profile already exists for a given citizen.
   * This enforces the one-to-one relationship between a citizen and a health profile.
   * @param {string} citizenId - The ID of the citizen to check.
   * @throws {Error} If a profile already exists for the citizen.
   */
  checkDuplicateProfile(citizenId) {
    const profileExists = this.healthRepository.exists(citizenId);
    if (profileExists) {
      WK.logger().warn(`Attempted to create a duplicate health profile for citizen: ${citizenId}`, 'HealthRule');
      throw new Error(`A health profile already exists for citizen with ID ${citizenId}.`);
    }
  }
}