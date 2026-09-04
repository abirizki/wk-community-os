/**
 * @class WorkflowRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Workflow entities.
 */
class WorkflowRepository extends BaseRepository {
  constructor() {
    super('workflows');
  }

  /**
   * Creates a new workflow instance record.
   * @param {Workflow} entity - The entity to create.
   * @returns {Workflow} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Workflow.fromObject(createdRecord);
  }

  /**
   * Updates an existing workflow instance record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Workflow} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.history) {
      updateData.history = JSON.stringify(updateData.history);
    }
    if (updateData.variables) {
      updateData.variables = JSON.stringify(updateData.variables);
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Workflow.fromObject(updatedRecord);
  }

  /**
   * Finds a workflow instance by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Workflow|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Workflow.fromObject(record);
  }

  /**
   * Finds an active workflow instance by its business context.
   * @param {string} contextType - The type of the business entity.
   * @param {string} contextId - The ID of the business entity.
   * @returns {Workflow|null}
   */
  findActiveByContext(contextType, contextId) {
    const record = this.dbAdapter.findOne(this.tableName, {
      contextType,
      contextId,
      status: 'IN_PROGRESS',
    });
    return Workflow.fromObject(record);
  }

  /**
   * Searches for workflow instances based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Workflow[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Workflow.fromObject);
  }
}