/**
 * @class <<serviceName>>
 * @description The main service for the <<packageName>> module, handling all business logic.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<serviceName>> {
  /**
   * @param {<<repositoryName>>} <<repositoryInstanceName>>
   * @param {<<validatorName>>} <<validatorInstanceName>>
   */
  constructor(<<repositoryInstanceName>>, <<validatorInstanceName>>) {
    /** @private */
    this.<<repositoryInstanceName>> = <<repositoryInstanceName>>;
    /** @private */
    this.<<validatorInstanceName>> = <<validatorInstanceName>>;
    /** @private */
    this.eventBus = WK.service('eventbus');
  }

  /**
   * Creates a new <<packageName>> entity.
   * @param {object} data - The data for the new entity.
   * @returns {<<entityName>>} The created entity.
   */
  create(data) {
    WK.security().checkPermission('<<permissionPrefix>>.create');
    WK.logger().info('<<serviceName>>: Creating new entity.');

    // 1. Validate input data
    this.<<validatorInstanceName>>.validateForCreate(data);

    // 2. Create the entity
    const newEntity = this.<<repositoryInstanceName>>.create(data);

    // 3. Publish an event
    if (this.eventBus) {
      this.eventBus.publish({
        eventType: '<<packageName>>.Created',
        module: '<<packageLowercase>>',
        referenceId: newEntity.id,
        payload: { newData: newEntity }
      });
    }

    return newEntity;
  }

  /**
   * Retrieves an entity by its ID.
   * @param {string} id - The ID of the entity.
   * @returns {<<entityName>>|null} The entity or null if not found.
   */
  getById(id) {
    WK.security().checkPermission('<<permissionPrefix>>.view');
    return this.<<repositoryInstanceName>>.findById(id);
  }

  /**
   * Retrieves all entities matching a query.
   * @param {object} [query={}] - The filter query.
   * @param {object} [options={}] - Pagination and sorting options.
   * @returns {<<entityName>>[]} An array of entities.
   */
  findAll(query = {}, options = {}) {
    WK.security().checkPermission('<<permissionPrefix>>.view');
    return this.<<repositoryInstanceName>>.findAll(query, options);
  }

  /**
   * Updates an existing entity.
   * @param {string} id - The ID of the entity to update.
   * @param {object} updateData - The data to update.
   * @returns {<<entityName>>} The updated entity.
   */
  update(id, updateData) {
    // [TODO: Implement update logic, including validation, permission checks, and event publishing]
    return this.<<repositoryInstanceName>>.update(id, updateData);
  }
}