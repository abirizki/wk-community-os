/**
 * @class HealthProfileRepository
 * @description Handles data access logic for citizen health profiles.
 */
class HealthProfileRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('health_profiles');
    WK.logger().info('HealthProfileRepository initialized for table: health_profiles');
  }

  /**
   * Finds a health profile by citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {HealthProfileEntity|null}
   */
  findByCitizenId(citizenId) {
    return this.db.findOne({ citizenId: citizenId });
  }

  /**
   * Creates or updates a health profile for a citizen.
   * @param {object} profileData - The health profile data.
   * @returns {HealthProfileEntity} The saved health profile.
   */
  save(profileData) {
    // Use citizenId as the unique key for saving to ensure one profile per citizen.
    return this.db.save(profileData, ['citizenId']);
  }
}