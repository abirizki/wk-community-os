/**
 * @class ImmunizationRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for ImmunizationRecord entities.
 */
class ImmunizationRepository extends BaseRepository {
  constructor() {
    super('immunization_records');
  }

  /**
   * Creates a new immunization record.
   * @param {ImmunizationRecord} entity - The entity to create.
   * @returns {ImmunizationRecord} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return ImmunizationRecord.fromObject(createdRecord);
  }

  /**
   * Updates an existing immunization record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {ImmunizationRecord} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return ImmunizationRecord.fromObject(updatedRecord);
  }

  /**
   * Soft deletes an immunization record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds an immunization record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {ImmunizationRecord|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return ImmunizationRecord.fromObject(record);
  }

  /**
   * Finds all immunization records for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {ImmunizationRecord[]}
   */
  findByCitizen(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(ImmunizationRecord.fromObject);
  }

  /**
   * Finds the latest immunization record for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {ImmunizationRecord|null}
   */
  findLatestByCitizen(citizenId) {
    const options = { sortBy: 'administrationDate', order: 'desc', limit: 1 };
    const records = this.findByCitizen(citizenId, options);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Finds immunization records within a given date range.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {ImmunizationRecord[]}
   */
  findByDateRange(startDate, endDate, options = {}) {
    const query = { administrationDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Finds immunization records with an upcoming next dose date.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {ImmunizationRecord[]}
   */
  findUpcoming(startDate, endDate, options = {}) {
    const query = { nextDoseDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Searches for immunization records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {ImmunizationRecord[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(ImmunizationRecord.fromObject);
  }

  /**
   * Lists all immunization records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {ImmunizationRecord[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(ImmunizationRecord.fromObject);
  }

  /**
   * Counts the total number of immunization records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }

  /**
   * Checks if an immunization record exists for a given ID.
   * @param {string} id - The ID of the record.
   * @returns {boolean}
   */
  exists(id) {
    return this.dbAdapter.exists(this.tableName, { id });
  }
}