/**
 * @class ChronicDiseaseEntity
 * @description Represents a diagnosed chronic disease for a citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ChronicDiseaseEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the record.
   * @param {string} params.healthProfileId - The ID of the health profile this record belongs to.
   * @param {string} params.diseaseName - Name of the disease (e.g., 'Diabetes Mellitus Type 2', 'Hypertension').
   * @param {string} params.diagnosedAt - ISO 8601 date of diagnosis.
   * @param {string} [params.notes] - Notes from the diagnosing physician.
   * @param {boolean} [params.isActive=true] - Whether the condition is currently active.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    healthProfileId,
    diseaseName,
    diagnosedAt,
    notes,
    isActive = true,
    createdAt
  }) {
    this.id = id;
    this.healthProfileId = healthProfileId;
    this.diseaseName = diseaseName;
    this.diagnosedAt = diagnosedAt;
    this.notes = notes || null;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}