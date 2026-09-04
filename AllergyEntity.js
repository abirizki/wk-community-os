/**
 * @class AllergyEntity
 * @description Represents a specific allergy for a citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class AllergyEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the allergy record.
   * @param {string} params.healthProfileId - The ID of the health profile this allergy belongs to.
   * @param {string} params.allergen - The substance the citizen is allergic to (e.g., 'Pollen', 'Peanuts', 'Penicillin').
   * @param {string} [params.reaction] - Description of the allergic reaction.
   * @param {string} params.recordedAt - ISO 8601 timestamp when the allergy was recorded.
   */
  constructor({
    id,
    healthProfileId,
    allergen,
    reaction,
    recordedAt
  }) {
    this.id = id;
    this.healthProfileId = healthProfileId;
    this.allergen = allergen;
    this.reaction = reaction || null;
    this.recordedAt = recordedAt;
  }
}