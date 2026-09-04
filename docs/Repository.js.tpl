/**
 * @class <<repositoryName>>
 * @description Handles all data access logic for the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<repositoryName>> {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('<<tableName>>');
    WK.logger().info('<<repositoryName>> initialized for table: <<tableName>>');
  }

  /**
   * Creates a new <<entityName>> record.
   * @param {object} data - The data for the new entity.
   * @returns {<<entityName>>} The created entity.
   */
  create(data) {
    WK.logger().debug(`<<repositoryName>>: Creating new record.`);
    return this.db.create(data);
  }

  /**
   * Finds a record by its unique ID.
   * @param {string} id - The unique ID of the entity.
   * @returns {<<entityName>>|null} The found entity or null.
   */
  findById(id) {
    WK.logger().debug(`<<repositoryName>>: Finding record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {<<entityName>>[]} An array of entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`<<repositoryName>>: Finding records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing record.
   * @param {string} id - The ID of the entity to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {<<entityName>>} The updated entity.
   */
  update(id, updateData) {
    WK.logger().debug(`<<repositoryName>>: Updating record ID: ${id}`);
    return this.db.update(id, updateData);
  }

  /**
   * Deletes a record by its ID.
   * @param {string} id - The ID of the entity to delete.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id) {
    WK.logger().debug(`<<repositoryName>>: Deleting record ID: ${id}`);
    return this.db.delete(id);
  }
}