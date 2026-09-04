/**
 * @class AttendanceRecordRepository
 * @description Handles data access logic for attendance records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class AttendanceRecordRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_attendance_records');
    WK.logger().info('AttendanceRecordRepository initialized for table: education_attendance_records');
  }

  /**
   * Creates a new AttendanceRecordEntity record.
   * @param {object} data - The data for the new attendance record.
   * @returns {AttendanceRecordEntity} The created attendance record entity.
   */
  create(data) {
    WK.logger().debug(`AttendanceRecordRepository: Creating new attendance record.`);
    return this.db.create(data);
  }

  /**
   * Finds an attendance record by its unique ID.
   * @param {string} id - The unique ID of the attendance record.
   * @returns {AttendanceRecordEntity|null} The found attendance record entity or null.
   */
  findById(id) {
    WK.logger().debug(`AttendanceRecordRepository: Finding attendance record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all attendance records for a specific student.
   * @param {string} studentId - The ID of the student.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {AttendanceRecordEntity[]} An array of attendance record entities.
   */
  findByStudentId(studentId, options = {}) {
    WK.logger().debug(`AttendanceRecordRepository: Finding attendance records by Student ID: ${studentId}`);
    return this.db.findAll({ studentId: studentId }, options);
  }

  /**
   * Updates an existing attendance record.
   * @param {string} id - The ID of the attendance record to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {AttendanceRecordEntity} The updated attendance record entity.
   */
  update(id, updateData) {
    WK.logger().debug(`AttendanceRecordRepository: Updating attendance record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}