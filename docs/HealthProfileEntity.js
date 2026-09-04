/**
 * @class HealthProfileEntity
 * @description Represents the static, long-term health profile of a single citizen.
 */
class HealthProfileEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the health profile.
   * @param {string} params.citizenId - The ID of the citizen this profile belongs to.
   * @param {string} [params.bloodType] - e.g., 'A+', 'B-', 'O+'.
   * @param {string[]} [params.allergies] - List of known allergies.
   * @param {string[]} [params.chronicDiseases] - List of diagnosed chronic diseases.
   * @param {string[]} [params.disabilities] - List of known disabilities.
   * @param {string} params.updatedAt - ISO 8601 timestamp of the last update.
   */
  constructor({
    id,
    citizenId,
    bloodType,
    allergies,
    chronicDiseases,
    disabilities,
    updatedAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.bloodType = bloodType || null;
    this.allergies = allergies || [];
    this.chronicDiseases = chronicDiseases || [];
    this.disabilities = disabilities || [];
    this.updatedAt = updatedAt;
  }
}