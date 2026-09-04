/**
 * @class LetterRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Letter entities.
 */
class LetterRepository extends BaseRepository {
  constructor() {
    super('letters');
  }

  /**
   * Creates a new letter record.
   * @param {Letter} entity - The entity to create.
   * @returns {Letter} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Letter.fromObject(createdRecord);
  }

  /**
   * Updates an existing letter record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Letter} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.content) {
      updateData.content = typeof updateData.content === 'object' ? JSON.stringify(updateData.content) : updateData.content;
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Letter.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a letter record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a letter by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Letter|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Letter.fromObject(record);
  }

  /**
   * Finds a letter by its official number.
   * @param {string} letterNumber - The official letter number.
   * @returns {Letter|null}
   */
  findByLetterNumber(letterNumber) {
    const record = this.dbAdapter.findOne(this.tableName, { letterNumber });
    return Letter.fromObject(record);
  }

  /**
   * Finds a letter by its associated administrative service request ID.
   * @param {string} administrativeServiceId - The ID of the admin service request.
   * @returns {Letter|null}
   */
  findByAdministrativeServiceId(administrativeServiceId) {
    const record = this.dbAdapter.findOne(this.tableName, { administrativeServiceId });
    return Letter.fromObject(record);
  }

  /**
   * Searches for letter records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Letter[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Letter.fromObject);
  }
}