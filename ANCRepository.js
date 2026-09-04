/**
 * @class ANCRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for ANCRecord entities.
 */
class ANCRepository extends BaseRepository {
  constructor() {
    super('anc_records');
  }

  /**
   * Creates a new ANC record.
   * @param {ANCRecord} entity - The ANC entity to create.
   * @returns {ANCRecord} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return ANCRecord.fromObject(createdRecord);
  }

  /**
   * Updates an existing ANC record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {ANCRecord} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return ANCRecord.fromObject(updatedRecord);
  }

  /**
   * Soft deletes an ANC record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds an ANC record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {ANCRecord|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return ANCRecord.fromObject(record);
  }

  /**
   * Finds all ANC records for a given pregnancy.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @param {object} [options] - Search options.
   * @returns {ANCRecord[]}
   */
  findByPregnancy(pregnancyId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { pregnancyId }, options);
    return records.map(ANCRecord.fromObject);
  }

  /**
   * Finds the latest ANC record for a given pregnancy.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @returns {ANCRecord|null}
   */
  findLatestByPregnancy(pregnancyId) {
    const options = { sortBy: 'visitDate', order: 'desc', limit: 1 };
    const records = this.findByPregnancy(pregnancyId, options);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Finds an ANC record by pregnancy ID and visit number.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @param {number} visitNumber - The visit number.
   * @returns {ANCRecord|null}
   */
  findByVisitNumber(pregnancyId, visitNumber) {
    const record = this.dbAdapter.findOne(this.tableName, { pregnancyId, visitNumber });
    return ANCRecord.fromObject(record);
  }

  /**
   * Finds ANC records within a given date range.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {ANCRecord[]}
   */
  findByDateRange(startDate, endDate, options = {}) {
    const query = { visitDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Finds ANC records that require follow-up.
   * @param {object} [filters] - Additional filters.
   * @param {object} [options] - Search options.
   * @returns {ANCRecord[]}
   */
  findFollowUpRequired(filters = {}, options = {}) {
    const query = { ...filters, followUpRequired: true };
    return this.search(query, options);
  }

  /**
   * Finds ANC records that require referral.
   * @param {object} [filters] - Additional filters.
   * @param {object} [options] - Search options.
   * @returns {ANCRecord[]}
   */
  findReferralRequired(filters = {}, options = {}) {
    const query = { ...filters, referralRequired: true };
    return this.search(query, options);
  }

  /**
   * Searches for ANC records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {ANCRecord[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(ANCRecord.fromObject);
  }

  /**
   * Lists all ANC records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {ANCRecord[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(ANCRecord.fromObject);
  }

  /**
   * Counts the total number of ANC records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }

  /**
   * Checks if an ANC record exists for a given ID.
   * @param {string} id - The ID of the record.
   * @returns {boolean}
   */
  exists(id) {
    return this.dbAdapter.exists(this.tableName, { id });
  }
}