/**
 * @class AspirationRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Aspiration entities.
 */
class AspirationRepository extends BaseRepository {
  constructor() {
    super('aspirations');
  }

  /**
   * Creates a new aspiration record.
   * @param {Aspiration} entity - The entity to create.
   * @returns {Aspiration} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Aspiration.fromObject(createdRecord);
  }

  /**
   * Updates an existing aspiration record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Aspiration} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Aspiration.fromObject(updatedRecord);
  }

  /**
   * Soft deletes an aspiration record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds an aspiration by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Aspiration|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Aspiration.fromObject(record);
  }

  /**
   * Finds all aspirations submitted by a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {Aspiration[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(Aspiration.fromObject);
  }

  /**
   * Finds an aspiration by its associated workflow ID.
   * @param {string} workflowId - The ID of the workflow instance.
   * @returns {Aspiration|null}
   */
  findByWorkflowId(workflowId) {
    const record = this.dbAdapter.findOne(this.tableName, { workflowId });
    return Aspiration.fromObject(record);
  }

  /**
   * Searches for aspiration records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Aspiration[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Aspiration.fromObject);
  }
}