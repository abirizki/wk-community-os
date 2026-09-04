/**
 * @class MedicineRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Medicine master data entities.
 */
class MedicineRepository extends BaseRepository {
  constructor() {
    super('medicines');
  }

  /**
   * Creates a new medicine master record.
   * @param {Medicine} entity - The entity to create.
   * @returns {Medicine} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Medicine.fromObject(createdRecord);
  }

  /**
   * Updates an existing medicine master record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Medicine} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Medicine.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a medicine master record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a medicine by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Medicine|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Medicine.fromObject(record);
  }

  /**
   * Finds a medicine by its unique code.
   * @param {string} code - The medicine code.
   * @returns {Medicine|null}
   */
  findByCode(code) {
    const record = this.dbAdapter.findOne(this.tableName, { code });
    return Medicine.fromObject(record);
  }

  /**
   * Searches for medicine records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Medicine[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Medicine.fromObject);
  }

  /**
   * Lists all medicine records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {Medicine[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(Medicine.fromObject);
  }

  /**
   * Counts the total number of medicine records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }

  /**
   * Checks if a medicine exists for a given ID.
   * @param {string} id - The ID of the record.
   * @returns {boolean}
   */
  exists(id) {
    return this.dbAdapter.exists(this.tableName, { id });
  }
}