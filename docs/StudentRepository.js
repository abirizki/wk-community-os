/**
 * @class StudentRepository
 * @description Handles data access logic for student records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class StudentRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_students');
    WK.logger().info('StudentRepository initialized for table: education_students');
  }

  /**
   * Creates a new StudentEntity record.
   * @param {object} data - The data for the new student.
   * @returns {StudentEntity} The created student entity.
   */
  create(data) {
    WK.logger().debug(`StudentRepository: Creating new student record.`);
    return this.db.create(data);
  }

  /**
   * Finds a student record by its unique ID.
   * @param {string} id - The unique ID of the student.
   * @returns {StudentEntity|null} The found student entity or null.
   */
  findById(id) {
    WK.logger().debug(`StudentRepository: Finding student record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds a student record by citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {StudentEntity|null} The found student entity or null.
   */
  findByCitizenId(citizenId) {
    WK.logger().debug(`StudentRepository: Finding student record by Citizen ID: ${citizenId}`);
    return this.db.findOne({ citizenId: citizenId });
  }

  /**
   * Finds all student records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {StudentEntity[]} An array of student entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`StudentRepository: Finding student records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing student record.
   * @param {string} id - The ID of the student to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {StudentEntity} The updated student entity.
   */
  update(id, updateData) {
    WK.logger().debug(`StudentRepository: Updating student record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}