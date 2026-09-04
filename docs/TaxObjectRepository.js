/**
 * @class TaxObjectRepository
 * @description Handles data access logic for Tax Object (NOP) records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class TaxObjectRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('pbb_tax_objects');
    WK.logger().info('TaxObjectRepository initialized for table: pbb_tax_objects');
  }

  /**
   * Creates a new TaxObjectEntity record.
   * @param {object} data - The data for the new tax object.
   * @returns {TaxObjectEntity} The created tax object entity.
   */
  create(data) {
    WK.logger().debug(`TaxObjectRepository: Creating new tax object record.`);
    return this.db.create(data);
  }

  /**
   * Finds a tax object record by its unique ID.
   * @param {string} id - The unique ID of the tax object.
   * @returns {TaxObjectEntity|null} The found tax object entity or null.
   */
  findById(id) {
    WK.logger().debug(`TaxObjectRepository: Finding tax object record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds a tax object record by its NOP.
   * @param {string} nop - The NOP of the tax object.
   * @returns {TaxObjectEntity|null} The found tax object entity or null.
   */
  findByNop(nop) {
    WK.logger().debug(`TaxObjectRepository: Finding tax object record by NOP: ${nop}`);
    return this.db.findOne({ nop: nop });
  }

  /**
   * Finds all tax object records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {TaxObjectEntity[]} An array of tax object entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`TaxObjectRepository: Finding tax object records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing tax object record.
   * @param {string} id - The ID of the tax object to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {TaxObjectEntity} The updated tax object entity.
   */
  update(id, updateData) {
    WK.logger().debug(`TaxObjectRepository: Updating tax object record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}