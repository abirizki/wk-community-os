/**
 * @class DropoutRecordRepository
 * @description Handles data access logic for dropout records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class DropoutRecordRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_dropout_records');
    WK.logger().info('DropoutRecordRepository initialized for table: education_dropout_records');
  }

  /**
   * Creates a new DropoutRecordEntity record.
   * @param {object} data - The data for the new dropout record.
   * @returns {DropoutRecordEntity} The created dropout record entity.
   */
  create(data) {
    WK.logger().debug(`DropoutRecordRepository: Creating new dropout record.`);
    return this.db.create(data);
  }

  /**
   * Finds a dropout record by its unique ID.
   * @param {string} id - The unique ID of the dropout record.
   * @returns {DropoutRecordEntity|null} The found dropout record entity or null.
   */
  findById(id) {
    WK.logger().debug(`DropoutRecordRepository: Finding dropout record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all dropout records for a specific student.
   * @param {string} studentId - The ID of the student.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {DropoutRecordEntity[]} An array of dropout record entities.
   */
  findByStudentId(studentId, options = {}) {
    WK.logger().debug(`DropoutRecordRepository: Finding dropout records by Student ID: ${studentId}`);
    return this.db.findAll({ studentId: studentId }, options);
  }

  /**
   * Updates an existing dropout record.
   * @param {string} id - The ID of the dropout record to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {DropoutRecordEntity} The updated dropout record entity.
   */
  update(id, updateData) {
    WK.logger().debug(`DropoutRecordRepository: Updating dropout record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}