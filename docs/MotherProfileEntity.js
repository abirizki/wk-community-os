/**
 * @class MotherProfileEntity
 * @description Represents the maternal health profile of a female citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class MotherProfileEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier.
   * @param {string} params.citizenId - The ID of the female citizen.
   * @param {boolean} params.isPregnant - Current pregnancy status.
   * @param {string} [params.estimatedDueDate] - ISO 8601 date if pregnant.
   * @param {number} [params.pregnancyWeek] - Current week of pregnancy.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    citizenId,
    isPregnant = false,
    estimatedDueDate,
    pregnancyWeek,
    createdAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.isPregnant = isPregnant;
    this.estimatedDueDate = estimatedDueDate || null;
    this.pregnancyWeek = pregnancyWeek || null;
    this.createdAt = createdAt;
  }
}