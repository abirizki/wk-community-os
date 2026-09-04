/**
 * @class TaxpayerRepository
 * @description Handles data access logic for Taxpayer records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class TaxpayerRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('pbb_taxpayers');
    WK.logger().info('TaxpayerRepository initialized for table: pbb_taxpayers');
  }

  /**
   * Creates a new TaxpayerEntity record.
   * @param {object} data - The data for the new taxpayer.
   * @returns {TaxpayerEntity} The created taxpayer entity.
   */
  create(data) {
    WK.logger().debug(`TaxpayerRepository: Creating new taxpayer record.`);
    return this.db.create(data);
  }

  /**
   * Finds a taxpayer record by its unique ID.
   * @param {string} id - The unique ID of the taxpayer.
   * @returns {TaxpayerEntity|null} The found taxpayer entity or null.
   */
  findById(id) {
    WK.logger().debug(`TaxpayerRepository: Finding taxpayer record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds a taxpayer record by citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {TaxpayerEntity|null} The found taxpayer entity or null.
   */
  findByCitizenId(citizenId) {
    WK.logger().debug(`TaxpayerRepository: Finding taxpayer record by Citizen ID: ${citizenId}`);
    return this.db.findOne({ citizenId: citizenId });
  }

  /**
   * Finds all taxpayer records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {TaxpayerEntity[]} An array of taxpayer entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`TaxpayerRepository: Finding taxpayer records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing taxpayer record.
   * @param {string} id - The ID of the taxpayer to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {TaxpayerEntity} The updated taxpayer entity.
   */
  update(id, updateData) {
    WK.logger().debug(`TaxpayerRepository: Updating taxpayer record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}