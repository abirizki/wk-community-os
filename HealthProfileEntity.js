/**
 * @class HealthProfileEntity
 * @description Represents the central, lifelong health profile of a citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class HealthProfileEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the health profile.
   * @param {string} params.citizenId - The ID of the citizen this profile belongs to. Must be unique.
   * @param {string} [params.bloodType] - Citizen's blood type (e.g., 'A+', 'O-').
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    citizenId,
    bloodType,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.bloodType = bloodType || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}