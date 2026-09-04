/**
 * @class ComplaintRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Complaint entities.
 */
class ComplaintRepository extends BaseRepository {
  constructor() {
    super('complaints');
  }

  /**
   * Creates a new complaint record.
   * @param {Complaint} entity - The entity to create.
   * @returns {Complaint} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Complaint.fromObject(createdRecord);
  }

  /**
   * Updates an existing complaint record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Complaint} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Complaint.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a complaint record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a complaint by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Complaint|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Complaint.fromObject(record);
  }

  /**
   * Finds all complaints filed by a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {Complaint[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(Complaint.fromObject);
  }

  /**
   * Finds a complaint by its associated workflow ID.
   * @param {string} workflowId - The ID of the workflow instance.
   * @returns {Complaint|null}
   */
  findByWorkflowId(workflowId) {
    const record = this.dbAdapter.findOne(this.tableName, { workflowId });
    return Complaint.fromObject(record);
  }

  /**
   * Searches for complaint records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Complaint[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Complaint.fromObject);
  }
}