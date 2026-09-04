/**
 * @class SPPTRepository
 * @description Handles data access logic for SPPT records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class SPPTRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('pbb_sppt');
    WK.logger().info('SPPTRepository initialized for table: pbb_sppt');
  }

  /**
   * Creates a new SPPTEntity record.
   * @param {object} data - The data for the new SPPT.
   * @returns {SPPTEntity} The created SPPT entity.
   */
  create(data) {
    WK.logger().debug(`SPPTRepository: Creating new SPPT record.`);
    return this.db.create(data);
  }

  /**
   * Finds an SPPT record by its unique ID.
   * @param {string} id - The unique ID of the SPPT.
   * @returns {SPPTEntity|null} The found SPPT entity or null.
   */
  findById(id) {
    WK.logger().debug(`SPPTRepository: Finding SPPT record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all SPPT records for a specific taxpayer.
   * @param {string} taxpayerId - The ID of the taxpayer.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {SPPTEntity[]} An array of SPPT entities.
   */
  findByTaxpayerId(taxpayerId, options = {}) {
    WK.logger().debug(`SPPTRepository: Finding SPPT records by Taxpayer ID: ${taxpayerId}`);
    return this.db.findAll({ taxpayerId: taxpayerId }, options);
  }

  /**
   * Finds all SPPT records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {SPPTEntity[]} An array of SPPT entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`SPPTRepository: Finding SPPT records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing SPPT record.
   * @param {string} id - The ID of the SPPT to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {SPPTEntity} The updated SPPT entity.
   */
  update(id, updateData) {
    WK.logger().debug(`SPPTRepository: Updating SPPT record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}