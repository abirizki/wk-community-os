/**
 * @class EducationValidator
 * @description Provides validation logic for the Education module's data.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationValidator {
  constructor() {}

  /**
   * Validates data for a new student registration.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateStudentRegistration(data) {
    if (!data) throw new Error('Student data is required.');
    if (!data.citizenId) throw new Error('Citizen ID is required for student registration.');
    if (!data.schoolId) throw new Error('School ID is required for student registration.');
    if (!data.currentEducationLevel) throw new Error('Current education level is required.');
    if (!data.currentGrade) throw new Error('Current grade is required.');
  }

  /**
   * Validates data for updating a student record.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateStudentUpdate(data) {
    if (!data) throw new Error('Update data is required.');
    // No specific fields are strictly required for an update, but at least one should be present.
    if (Object.keys(data).length === 0) throw new Error('No update data provided.');
  }

  /**
   * Validates data for a new school registration.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateSchoolRegistration(data) {
    if (!data) throw new Error('School data is required.');
    if (!data.name) throw new Error('School name is required.');
    if (!data.type) throw new Error('School type is required.');
    if (!data.address || !data.address.street) throw new Error('School address is required.');
  }

  /**
   * Validates data for a scholarship application.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateScholarshipApplication(data) {
    if (!data) throw new Error('Scholarship application data is required.');
    if (!data.citizenId) throw new Error('Citizen ID is required for scholarship application.');
    if (!data.programName) throw new Error('Scholarship program name is required.');
  }

  /**
   * Validates data for an attendance record.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateAttendanceRecord(data) {
    if (!data) throw new Error('Attendance record data is required.');
    if (!data.studentId) throw new Error('Student ID is required for attendance record.');
    if (!data.recordDate) throw new Error('Record date is required for attendance.');
    if (!data.status) throw new Error('Attendance status is required.');
  }

  /**
   * Validates data for literacy program enrollment.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateLiteracyEnrollment(data) {
    if (!data) throw new Error('Literacy enrollment data is required.');
    if (!data.citizenId) throw new Error('Citizen ID is required for literacy enrollment.');
    if (!data.programName) throw new Error('Program name is required for literacy enrollment.');
  }
}