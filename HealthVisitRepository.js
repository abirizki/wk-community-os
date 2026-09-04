/**
 * @class HealthVisitRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for HealthVisit entities.
 */
class HealthVisitRepository extends BaseRepository {
  constructor() {
    super('health_visits');
  }

  /**
   * Creates a new health visit record.
   * @param {HealthVisit} entity - The entity to create.
   * @returns {HealthVisit} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return HealthVisit.fromObject(createdRecord);
  }

  /**
   * Updates an existing health visit record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {HealthVisit} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return HealthVisit.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a health visit record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a health visit by its ID.
   * @param {string} id - The ID of the record.
   * @returns {HealthVisit|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return HealthVisit.fromObject(record);
  }

  /**
   * Finds all health visits for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {HealthVisit[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(HealthVisit.fromObject);
  }

  /**
   * Finds health visits within a given date range.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {HealthVisit[]}
   */
  findByDateRange(startDate, endDate, options = {}) {
    const query = { visitDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Searches for health visit records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {HealthVisit[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(HealthVisit.fromObject);
  }

  /**
   * Lists all health visit records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {HealthVisit[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(HealthVisit.fromObject);
  }

  /**
   * Counts the total number of health visit records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }
}