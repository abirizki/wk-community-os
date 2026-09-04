/**
 * @class ScholarshipEntity
 * @description Represents a scholarship program or an individual scholarship award.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class ScholarshipEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the scholarship.
   * @param {string} params.programName - Name of the scholarship program.
   * @param {string} params.citizenId - The ID of the citizen receiving the scholarship.
   * @param {string} params.status - Current status (e.g., 'APPLIED', 'APPROVED', 'REJECTED', 'AWARDED', 'COMPLETED').
   * @param {number} [params.amount] - Awarded amount, if applicable.
   * @param {string} [params.startDate] - ISO 8601 start date of the scholarship period.
   * @param {string} [params.endDate] - ISO 8601 end date of the scholarship period.
   * @param {string} [params.notes] - Additional notes.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    programName,
    citizenId,
    status,
    amount,
    startDate,
    endDate,
    notes,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.programName = programName;
    this.citizenId = citizenId;
    this.status = status;
    this.amount = amount || null;
    this.startDate = startDate || null;
    this.endDate = endDate || null;
    this.notes = notes || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}