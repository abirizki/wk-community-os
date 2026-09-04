/**
 * @class LiteracyProgramEntity
 * @description Represents a literacy program and a citizen's enrollment in it.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class LiteracyProgramEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the enrollment.
   * @param {string} params.citizenId - The ID of the citizen participating.
   * @param {string} params.programName - Name of the literacy program.
   * @param {string} params.enrollmentDate - ISO 8601 date of enrollment.
   * @param {string} params.status - Enrollment status (e.g., 'ENROLLED', 'COMPLETED', 'DROPPED_OUT').
   * @param {string} [params.completionDate] - ISO 8601 date of completion.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    citizenId,
    programName,
    enrollmentDate,
    status,
    completionDate,
    createdAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.programName = programName;
    this.enrollmentDate = enrollmentDate;
    this.status = status;
    this.completionDate = completionDate || null;
    this.createdAt = createdAt;
  }
}