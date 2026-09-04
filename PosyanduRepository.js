/**
 * @class PosyanduRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for PosyanduVisit entities.
 */
class PosyanduRepository extends BaseRepository {
  constructor() {
    super('posyandu_visits');
  }

  /**
   * Creates a new Posyandu visit record.
   * @param {PosyanduVisit} entity - The entity to create.
   * @returns {PosyanduVisit} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return PosyanduVisit.fromObject(createdRecord);
  }

  /**
   * Updates an existing Posyandu visit record.
   * @param {string} id - The ID of the visit to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {PosyanduVisit} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return PosyanduVisit.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a Posyandu visit record.
   * @param {string} id - The ID of the visit to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a Posyandu visit by its ID.
   * @param {string} id - The ID of the visit.
   * @returns {PosyanduVisit|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return PosyanduVisit.fromObject(record);
  }

  /**
   * Finds all Posyandu visits for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {PosyanduVisit[]}
   */
  findByCitizen(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Finds all Posyandu visits on a specific date.
   * @param {string} date - The visit date in YYYY-MM-DD format.
   * @param {object} [options] - Search options.
   * @returns {PosyanduVisit[]}
   */
  findByDate(date, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { visitDate: date }, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Finds all Posyandu visits for a specific RT.
   * @param {string} rt - The RT number.
   * @param {object} [options] - Search options.
   * @returns {PosyanduVisit[]}
   */
  findByRT(rt, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { rt }, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Finds all Posyandu visits for a specific RW.
   * @param {string} rw - The RW number.
   * @param {object} [options] - Search options.
   * @returns {PosyanduVisit[]}
   */
  findByRW(rw, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { rw }, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Searches for Posyandu visits based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {PosyanduVisit[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Lists all Posyandu visits with pagination.
   * @param {object} [options] - Listing options.
   * @returns {PosyanduVisit[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(PosyanduVisit.fromObject);
  }

  /**
   * Counts the total number of Posyandu visits matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }
}