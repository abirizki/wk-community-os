/**
 * @class AdministrativeServiceRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for AdministrativeService entities.
 */
class AdministrativeServiceRepository extends BaseRepository {
  constructor() {
    super('administrative_services');
  }

  /**
   * Creates a new administrative service record.
   * @param {AdministrativeService} entity - The entity to create.
   * @returns {AdministrativeService} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return AdministrativeService.fromObject(createdRecord);
  }

  /**
   * Updates an existing administrative service record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {AdministrativeService} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.notes) {
      updateData.notes = JSON.stringify(updateData.notes);
    }
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return AdministrativeService.fromObject(updatedRecord);
  }

  /**
   * Soft deletes an administrative service record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds an administrative service record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {AdministrativeService|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return AdministrativeService.fromObject(record);
  }

  /**
   * Finds all administrative service records for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {AdministrativeService[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(AdministrativeService.fromObject);
  }

  /**
   * Finds all administrative service records for a given family.
   * @param {string} familyId - The ID of the family.
   * @param {object} [options] - Search options.
   * @returns {AdministrativeService[]}
   */
  findByFamilyId(familyId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { familyId }, options);
    return records.map(AdministrativeService.fromObject);
  }

  /**
   * Searches for administrative service records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {AdministrativeService[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(AdministrativeService.fromObject);
  }

  /**
   * Lists all administrative service records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {AdministrativeService[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(AdministrativeService.fromObject);
  }

  /**
   * Counts the total number of administrative service records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }

  /**
   * Checks if an administrative service record exists by its ID.
   * @param {string} id - The ID of the record.
   * @returns {boolean}
   */
  exists(id) {
    return this.dbAdapter.exists(this.tableName, { id });
  }
}