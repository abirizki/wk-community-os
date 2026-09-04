/**
 * @class ReferralRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Referral entities.
 */
class ReferralRepository extends BaseRepository {
  constructor() {
    super('referrals');
  }

  /**
   * Creates a new referral record.
   * @param {Referral} entity - The entity to create.
   * @returns {Referral} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Referral.fromObject(createdRecord);
  }

  /**
   * Updates an existing referral record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Referral} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Referral.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a referral record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a referral record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Referral|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Referral.fromObject(record);
  }

  /**
   * Finds all referral records for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options] - Search options.
   * @returns {Referral[]}
   */
  findByCitizen(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(Referral.fromObject);
  }

  /**
   * Finds the latest referral record for a given citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {Referral|null}
   */
  getLatestByCitizen(citizenId) {
    const options = { sortBy: 'referralDate', order: 'desc', limit: 1 };
    const records = this.findByCitizen(citizenId, options);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Finds referral records within a given date range.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {Referral[]}
   */
  findByDateRange(startDate, endDate, options = {}) {
    const query = { referralDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Finds referral records with an upcoming follow-up date.
   * @param {string} startDate - The start date of the range.
   * @param {string} endDate - The end date of the range.
   * @param {object} [options] - Search options.
   * @returns {Referral[]}
   */
  findByFollowUpDate(startDate, endDate, options = {}) {
    const query = { followUpDate: { gte: startDate, lte: endDate } };
    return this.search(query, options);
  }

  /**
   * Searches for referral records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Referral[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Referral.fromObject);
  }

  /**
   * Lists all referral records with pagination.
   * @param {object} [options] - Listing options.
   * @returns {Referral[]}
   */
  list(options = {}) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(Referral.fromObject);
  }

  /**
   * Counts the total number of referral records matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number}
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }
}