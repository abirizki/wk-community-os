/**
 * @class SchoolRepository
 * @description Handles data access logic for school records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class SchoolRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('education_schools');
    WK.logger().info('SchoolRepository initialized for table: education_schools');
  }

  /**
   * Creates a new SchoolEntity record.
   * @param {object} data - The data for the new school.
   * @returns {SchoolEntity} The created school entity.
   */
  create(data) {
    WK.logger().debug(`SchoolRepository: Creating new school record.`);
    return this.db.create(data);
  }

  /**
   * Finds a school record by its unique ID.
   * @param {string} id - The unique ID of the school.
   * @returns {SchoolEntity|null} The found school entity or null.
   */
  findById(id) {
    WK.logger().debug(`SchoolRepository: Finding school record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds a school record by its name.
   * @param {string} name - The name of the school.
   * @returns {SchoolEntity|null} The found school entity or null.
   */
  findByName(name) {
    WK.logger().debug(`SchoolRepository: Finding school record by name: ${name}`);
    return this.db.findOne({ name: name });
  }

  /**
   * Finds all school records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {SchoolEntity[]} An array of school entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`SchoolRepository: Finding school records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing school record.
   * @param {string} id - The ID of the school to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {SchoolEntity} The updated school entity.
   */
  update(id, updateData) {
    WK.logger().debug(`SchoolRepository: Updating school record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}