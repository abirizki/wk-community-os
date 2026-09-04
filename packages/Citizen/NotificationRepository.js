/**
 * @class NotificationRepository
 * @description Handles all data access logic for the Notification module.
 * This repository is primarily used for the user's Inbox and for logging sent notifications.
 */
class NotificationRepository {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('notifications');
    WK.logger().info('NotificationRepository initialized for table: notifications');
  }

  /**
   * Creates a new notification record.
   * @param {object} data - The notification data to create.
   * @returns {object} The newly created notification record.
   */
  create(data) {
    WK.logger().debug(`NotificationRepository: Creating notification for recipient: ${data.recipientId}`);
    return this.db.create(data);
  }

  /**
   * Updates an existing notification record, typically to change its status.
   * @param {string} id - The ID of the notification to update.
   * @param {object} data - The data to update (e.g., { status: 'READ', readAt: '...' }).
   * @returns {object} The updated notification record.
   */
  update(id, data) {
    WK.logger().debug(`NotificationRepository: Updating notification ID: ${id}`);
    return this.db.update(id, data);
  }

  /**
   * Finds a notification record by its unique ID.
   * @param {string} id - The unique ID of the notification.
   * @returns {object|null} The notification record if found.
   */
  findById(id) {
    return this.db.findById(id);
  }

  /**
   * Finds all notifications for a specific recipient (their inbox).
   * @param {string} recipientId - The ID of the user/citizen.
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {object[]} An array of notification records.
   */
  findByRecipient(recipientId, options = {}) {
    WK.logger().debug(`NotificationRepository: Finding notifications for recipient: ${recipientId}`);
    const query = { recipientId: recipientId };
    // Default sort by creation date descending
    const effectiveOptions = { sortBy: 'createdAt', order: 'desc', ...options };
    return this.db.findAll(query, effectiveOptions);
  }

  /**
   * Counts unread notifications for a specific recipient.
   * @param {string} recipientId - The ID of the user/citizen.
   * @returns {number} The number of unread notifications.
   */
  countUnread(recipientId) {
    return this.db.count({ recipientId: recipientId, status: { $ne: 'READ' } });
  }

  /**
   * Performs aggregation to generate statistics on notifications.
   * @param {object} aggregationPipeline - The pipeline definition for the aggregation.
   * @returns {object[]} The result of the aggregation.
   */
  statistics(aggregationPipeline) {
    WK.logger().debug(`NotificationRepository: Generating statistics with pipeline: ${JSON.stringify(aggregationPipeline)}`);
    return this.db.aggregate(aggregationPipeline);
  }
}