/**
 * @class EventRepository
 * @description Handles all data access logic for persisting events. This serves as the
 * permanent, auditable log of all events that have occurred in the system.
 */
class EventRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('events');
    WK.logger().info('EventRepository initialized for table: events');
  }

  /**
   * Creates a new event record in the persistent log.
   * @param {EventEntity} event - The event data to create.
   * @returns {object} The newly created event record.
   */
  create(event) {
    // Convert entity to a plain object for storage
    const data = { ...event };
    WK.logger().debug(`EventRepository: Persisting event ID: ${data.eventId}`);
    return this.db.create(data);
  }

  /**
   * Finds an event record by its unique ID.
   * @param {string} eventId - The unique ID of the event.
   * @returns {object|null} The event record if found, otherwise null.
   */
  findById(eventId) {
    WK.logger().debug(`EventRepository: Finding event by ID: ${eventId}`);
    return this.db.findOne({ eventId: eventId });
  }

  /**
   * Finds all event records matching a given query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {object[]} An array of event records.
   */
  findAll(query = {}, options = {}) {
    WK.logger().debug(`EventRepository: Finding all events with query: ${JSON.stringify(query)}`);
    return this.db.findAll(query, options);
  }

  /**
   * Counts the total number of records matching a query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering.
   * @returns {number} The total number of matching records.
   */
  count(query = {}) {
    WK.logger().debug(`EventRepository: Counting events with query: ${JSON.stringify(query)}`);
    return this.db.count(query);
  }

  /**
   * Performs aggregation to generate statistics on events.
   * @param {object} aggregationPipeline - The pipeline definition for the aggregation.
   * @returns {object[]} The result of the aggregation.
   */
  statistics(aggregationPipeline) {
    WK.logger().debug(`EventRepository: Generating statistics with pipeline: ${JSON.stringify(aggregationPipeline)}`);
    if (typeof this.db.aggregate !== 'function') {
      WK.logger().warn('EventRepository: dbAdapter does not support aggregate.');
      return [];
    }
    return this.db.aggregate(aggregationPipeline);
  }
}