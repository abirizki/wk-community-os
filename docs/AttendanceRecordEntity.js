/**
 * @class AttendanceRecordEntity
 * @description Records a student's attendance for a specific period.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class AttendanceRecordEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the attendance record.
   * @param {string} params.studentId - The ID of the student.
   * @param {string} params.recordDate - ISO 8601 date for which attendance is recorded.
   * @param {string} params.status - Attendance status (e.g., 'PRESENT', 'ABSENT', 'SICK', 'PERMITTED').
   * @param {string} [params.notes] - Additional notes.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    studentId,
    recordDate,
    status,
    notes,
    createdAt
  }) {
    this.id = id;
    this.studentId = studentId;
    this.recordDate = recordDate;
    this.status = status;
    this.notes = notes || null;
    this.createdAt = createdAt;
  }
}