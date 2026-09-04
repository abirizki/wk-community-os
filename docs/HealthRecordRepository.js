/**
 * @class HealthRecordRepository
 * @description Handles data access logic for time-series health records.
 */
class HealthRecordRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('health_records');
    WK.logger().info('HealthRecordRepository initialized for table: health_records');
  }

  /**
   * Creates a new health record.
   * @param {HealthRecordEntity} record - The health record entity to create.
   * @returns {HealthRecordEntity}
   */
  create(record) {
    return this.db.create(record);
  }

  /**
   * Finds a health record by its unique ID.
   * @param {string} id - The ID of the record.
   * @returns {HealthRecordEntity|null}
   */
  findById(id) {
    return this.db.findById(id);
  }

  /**
   * Finds all health records for a specific citizen, sorted by date.
   * @param {string} citizenId - The ID of the citizen.
   * @param {object} [options={}] - Additional query options.
   * @returns {HealthRecordEntity[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const query = { citizenId: citizenId };
    const effectiveOptions = {
      sortBy: 'recordDate',
      order: 'desc',
      ...options
    };
    return this.db.findAll(query, effectiveOptions);
  }
}