/**
 * @class StudentEntity
 * @description Represents a student record, linked to a citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class StudentEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the student record.
   * @param {string} params.citizenId - The ID of the citizen who is the student.
   * @param {string} params.schoolId - The ID of the school the student attends.
   * @param {string} params.currentEducationLevel - Current education level (e.g., 'SD', 'SMP', 'SMA').
   * @param {string} params.currentGrade - Current grade/class (e.g., 'Kelas 1', 'Tingkat 1').
   * @param {string} [params.enrollmentDate] - ISO 8601 date of enrollment.
   * @param {boolean} [params.isDropout=false] - True if the student has dropped out.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    citizenId,
    schoolId,
    currentEducationLevel,
    currentGrade,
    enrollmentDate,
    isDropout = false,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.schoolId = schoolId;
    this.currentEducationLevel = currentEducationLevel;
    this.currentGrade = currentGrade;
    this.enrollmentDate = enrollmentDate || null;
    this.isDropout = isDropout;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}