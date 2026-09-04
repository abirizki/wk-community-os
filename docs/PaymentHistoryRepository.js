/**
 * @class PaymentHistoryRepository
 * @description Handles data access logic for Payment History records.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PaymentHistoryRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('pbb_payment_history');
    WK.logger().info('PaymentHistoryRepository initialized for table: pbb_payment_history');
  }

  /**
   * Creates a new PaymentHistoryEntity record.
   * @param {object} data - The data for the new payment record.
   * @returns {PaymentHistoryEntity} The created payment history entity.
   */
  create(data) {
    WK.logger().debug(`PaymentHistoryRepository: Creating new payment history record.`);
    return this.db.create(data);
  }

  /**
   * Finds a payment history record by its unique ID.
   * @param {string} id - The unique ID of the payment record.
   * @returns {PaymentHistoryEntity|null} The found payment history entity or null.
   */
  findById(id) {
    WK.logger().debug(`PaymentHistoryRepository: Finding payment history record by ID: ${id}`);
    return this.db.findById(id);
  }

  /**
   * Finds all payment history records for a specific SPPT.
   * @param {string} spptId - The ID of the SPPT.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {PaymentHistoryEntity[]} An array of payment history entities.
   */
  findBySpptId(spptId, options = {}) {
    WK.logger().debug(`PaymentHistoryRepository: Finding payment history records by SPPT ID: ${spptId}`);
    return this.db.findAll({ spptId: spptId }, options);
  }

  /**
   * Finds all payment history records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {PaymentHistoryEntity[]} An array of payment history entities.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`PaymentHistoryRepository: Finding payment history records with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Updates an existing payment history record.
   * @param {string} id - The ID of the payment history record to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {PaymentHistoryEntity} The updated payment history entity.
   */
  update(id, updateData) {
    WK.logger().debug(`PaymentHistoryRepository: Updating payment history record ID: ${id}`);
    return this.db.update(id, updateData);
  }
}