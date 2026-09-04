/**
 * @class PregnancyRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Pregnancy entities.
 */
class PregnancyRepository extends BaseRepository {
  constructor() {
    super('pregnancy_episodes');
  }

  /**
   * Creates a new pregnancy record.
   * @param {Pregnancy} entity - The pregnancy entity to create.
   * @returns {Pregnancy} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Pregnancy.fromObject(createdRecord);
  }

  /**
   * Updates an existing pregnancy record.
   * @param {string} id - The ID of the pregnancy to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Pregnancy} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Pregnancy.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a pregnancy record.
   * @param {string} id - The ID of the pregnancy to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a pregnancy by its ID.
   * @param {string} id - The ID of the pregnancy.
   * @returns {Pregnancy|null} The found entity or null.
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Pregnancy.fromObject(record);
  }

  /**
   * Finds all pregnancies for a given mother.
   * @param {string} motherId - The ID of the mother.
   * @param {object} [options] - Search options.
   * @returns {Pregnancy[]} An array of found entities.
   */
  findByMother(motherId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { motherId }, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Finds all pregnancies for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {Pregnancy[]} An array of found entities.
   */
  findByCitizen(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Finds the active pregnancy for a given mother.
   * @param {string} motherId - The ID of the mother.
   * @returns {Pregnancy|null} The active pregnancy or null.
   */
  findActiveByMother(motherId) {
    const record = this.dbAdapter.findOne(this.tableName, { motherId, status: 'ACTIVE' });
    return Pregnancy.fromObject(record);
  }

  /**
   * Finds pregnancies by status.
   * @param {string} status - The pregnancy status.
   * @param {object} [options] - Search options.
   * @returns {Pregnancy[]} An array of found entities.
   */
  findByStatus(status, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { status }, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Finds pregnancies within a given date range.
   * @param {string} startDate - The start date of the range (ISO string).
   * @param {string} endDate - The end date of the range (ISO string).
   * @param {object} [options] - Search options.
   * @returns {Pregnancy[]} An array of found entities.
   */
  findByDateRange(startDate, endDate, options = {}) {
    const query = {
      startDate: { gte: startDate },
      actualEndDate: { lte: endDate },
    };
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Searches for pregnancy records based on a query and options.
   * @param {object} query - The search query.
   * @param {object} options - The search options (e.g., limit, offset, sortBy).
   * @returns {Pregnancy[]} An array of found entities.
   */
  search(query, options) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Lists all pregnancy records with pagination.
   * @param {object} options - The listing options (e.g., limit, offset, sortBy).
   * @returns {Pregnancy[]} An array of entities.
   */
  list(options) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(Pregnancy.fromObject);
  }

  /**
   * Counts the total number of pregnancy records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number} The total count.
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }

  /**
   * Checks if a pregnancy record exists for a given ID.
   * @param {string} id - The ID of the pregnancy.
   * @returns {boolean} True if a record exists.
   */
  exists(id) {
    return this.dbAdapter.exists(this.tableName, { id });
  }

  /**
   * Checks if an active pregnancy exists for a given mother ID.
   * @param {string} motherId - The ID of the mother.
   * @param {string} [excludePregnancyId] - An optional pregnancy ID to exclude from the check (e.g., during update).
   * @returns {boolean} True if an active pregnancy exists.
   */
  activePregnancyExists(motherId, excludePregnancyId = null) {
    const query = { motherId, status: 'ACTIVE' };
    if (excludePregnancyId) {
      query.id = { ne: excludePregnancyId };
    }
    return this.dbAdapter.exists(this.tableName, query);
  }
}