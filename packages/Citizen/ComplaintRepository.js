/**
 * @class ComplaintRepository
 * @description Handles all data access logic for the Complaint module.
 * It abstracts database operations for complaint records.
 */
class ComplaintRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('complaints');
    WK.logger().info('ComplaintRepository initialized for table: complaints');
  }

  /**
   * Creates a new complaint record.
   * @param {object} data - The complaint data to create.
   * @returns {object} The newly created complaint record.
   */
  create(data) {
    WK.logger().info(`ComplaintRepository: Creating new complaint for citizen: ${data.citizenId}`);
    return this.db.create(data);
  }

  /**
   * Updates an existing complaint record.
   * @param {string} id - The ID of the complaint to update.
   * @param {object} data - The data to update.
   * @returns {object} The updated complaint record.
   */
  update(id, data) {
    WK.logger().info(`ComplaintRepository: Updating complaint ID: ${id}`);
    return this.db.update(id, data);
  }

  /**
   * Finds a complaint record by its unique ID.
   * @param {string} id - The unique ID of the complaint.
   * @returns {object|null} The complaint record if found, otherwise null.
   */
  findById(id) {
    WK.logger().debug(`ComplaintRepository: Finding complaint by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds a complaint record by its public tracking number.
   * @param {string} trackingNumber - The public tracking number.
   * @returns {object|null} The complaint record if found, otherwise null.
   */
  findByTrackingNumber(trackingNumber) {
    WK.logger().debug(`ComplaintRepository: Finding complaint by tracking number: ${trackingNumber}`);
    return this.db.findOne({ trackingNumber: trackingNumber });
  }

  /**
   * Finds all complaint records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {object[]} An array of complaint records.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`ComplaintRepository: Finding all complaints with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Counts the total number of records matching a query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @returns {number} The total number of matching records.
   */
  count(query = {}) {
    WK.logger().debug(`ComplaintRepository: Counting complaints with query: ${JSON.stringify(query)}`);
    return this.db.count(query);
  }

  /**
   * Performs aggregation to generate statistics.
   * @param {object} aggregationPipeline - The pipeline definition for the aggregation.
   * @returns {object[]} The result of the aggregation.
   */
  statistics(aggregationPipeline) {
    WK.logger().debug(`ComplaintRepository: Generating statistics with pipeline: ${JSON.stringify(aggregationPipeline)}`);
    if (typeof this.db.aggregate !== 'function') {
      WK.logger().warn('ComplaintRepository: dbAdapter does not support aggregate.');
      return [];
    }
    return this.db.aggregate(aggregationPipeline);
  }
}