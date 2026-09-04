/**
 * @class ScholarshipRepository
 * @description Handles data access logic for scholarship records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class ScholarshipRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_scholarships');
    WK.logger().info('ScholarshipRepository initialized for table: education_scholarships');
  }

  /**
   * Creates a new ScholarshipEntity record.
   * @param {object} data - The data for the new scholarship.
   * @returns {ScholarshipEntity} The created scholarship entity.
   */
  create(data) {
    WK.logger().debug(`ScholarshipRepository: Creating new scholarship record.`);
    return this.db.create(data);
  }

  /**
   * Finds a scholarship record by its unique ID.
   * @param {string} id - The unique ID of the scholarship.
   * @returns {ScholarshipEntity|null} The found scholarship entity or null.
   */
  findById(id) {
    WK.logger().debug(`ScholarshipRepository: Finding scholarship record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all scholarship records for a specific citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {ScholarshipEntity[]} An array of scholarship entities.
   */
  findByCitizenId(citizenId, options = {}) {
    WK.logger().debug(`ScholarshipRepository: Finding scholarship records by Citizen ID: ${citizenId}`);
    return this.db.findAll({ citizenId: citizenId }, options);
  }

  /**
   * Finds all scholarship records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {ScholarshipEntity[]} An array of scholarship entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`ScholarshipRepository: Finding scholarship records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing scholarship record.
   * @param {string} id - The ID of the scholarship to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {ScholarshipEntity} The updated scholarship entity.
   */
  update(id, updateData) {
    WK.logger().debug(`ScholarshipRepository: Updating scholarship record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}