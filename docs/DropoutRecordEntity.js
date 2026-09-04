/**
 * @class DropoutRecordEntity
 * @description Records an instance of a student dropping out of school.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class DropoutRecordEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the dropout record.
   * @param {string} params.studentId - The ID of the student who dropped out.
   * @param {string} params.dropoutDate - ISO 8601 date when the student dropped out.
   * @param {string} params.reason - Reason for dropping out.
   * @param {string} [params.interventionStatus] - Status of any intervention efforts.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    studentId,
    dropoutDate,
    reason,
    interventionStatus,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.studentId = studentId;
    this.dropoutDate = dropoutDate;
    this.reason = reason;
    this.interventionStatus = interventionStatus || 'PENDING';
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}