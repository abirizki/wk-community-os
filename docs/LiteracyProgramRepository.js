/**
 * @class LiteracyProgramRepository
 * @description Handles data access logic for literacy program enrollments.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class LiteracyProgramRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_literacy_programs');
    WK.logger().info('LiteracyProgramRepository initialized for table: education_literacy_programs');
  }

  /**
   * Creates a new LiteracyProgramEntity record.
   * @param {object} data - The data for the new literacy program enrollment.
   * @returns {LiteracyProgramEntity} The created literacy program entity.
   */
  create(data) {
    WK.logger().debug(`LiteracyProgramRepository: Creating new literacy program record.`);
    return this.db.create(data);
  }

  /**
   * Finds a literacy program record by its unique ID.
   * @param {string} id - The unique ID of the literacy program enrollment.
   * @returns {LiteracyProgramEntity|null} The found literacy program entity or null.
   */
  findById(id) {
    WK.logger().debug(`LiteracyProgramRepository: Finding literacy program record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all literacy program records for a specific citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {LiteracyProgramEntity[]} An array of literacy program entities.
   */
  findByCitizenId(citizenId, options = {}) {
    WK.logger().debug(`LiteracyProgramRepository: Finding literacy program records by Citizen ID: ${citizenId}`);
    return this.db.findAll({ citizenId: citizenId }, options);
  }

  /**
   * Finds all literacy program records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {LiteracyProgramEntity[]} An array of literacy program entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`LiteracyProgramRepository: Finding literacy program records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing literacy program record.
   * @param {string} id - The ID of the literacy program enrollment to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {LiteracyProgramEntity} The updated literacy program entity.
   */
  update(id, updateData) {
    WK.logger().debug(`LiteracyProgramRepository: Updating literacy program record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}