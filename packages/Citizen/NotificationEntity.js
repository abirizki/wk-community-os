/**
 * @class NotificationEntity
 * @description Represents the data structure for a single notification instance
 * before and after it is sent.
 */
class NotificationEntity {
  /**
   * @param {object} params - The parameters to create a notification entity.
   * @param {string} params.id - Unique identifier (UUID) for this notification.
   * @param {string} params.recipientId - The ID of the target user/citizen.
   * @param {string} params.channel - The channel for delivery (e.g., 'INBOX', 'EMAIL', 'PUSH').
   * @param {string} params.priority - Priority level ('CRITICAL', 'HIGH', 'NORMAL', 'LOW').
   * @param {string} params.type - The type of notification (e.g., 'LETTER_APPROVED', 'COMPLAINT_NEW').
   * @param {string} params.title - The title of the notification.
   * @param {string} params.body - The main content/message of the notification.
   * @param {object} params.metadata - Additional data, like an action URL or reference ID.
   * @param {string} params.metadata.actionUrl - URL to navigate to when the notification is clicked.
   * @param {string} params.metadata.referenceId - The ID of the related business entity.
   * @param {string} [params.status='PENDING'] - The status in the queue ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'READ').
   * @param {number} [params.retryCount=0] - The number of times delivery has been attempted.
   * @param {string|null} [params.scheduledAt=null] - ISO 8601 timestamp for scheduled delivery.
   * @param {string|null} [params.expiresAt=null] - ISO 8601 timestamp when the notification is no longer relevant.
   * @param {string|null} [params.sentAt=null] - ISO 8601 timestamp when the notification was successfully sent.
   * @param {string|null} [params.readAt=null] - ISO 8601 timestamp when the notification was marked as read.
   * @param {string} params.createdAt - ISO 8601 timestamp of creation.
   */
  constructor({
    id,
    recipientId,
    channel,
    priority,
    type,
    title,
    body,
    metadata,
    status = 'PENDING',
    retryCount = 0,
    scheduledAt = null,
    expiresAt = null,
    sentAt = null,
    readAt = null,
    createdAt
  }) {
    this.id = id;
    this.recipientId = recipientId;
    this.channel = channel;
    this.priority = priority;
    this.type = type;
    this.title = title;
    this.body = body;
    this.metadata = metadata || {};
    this.status = status;
    this.retryCount = retryCount;
    this.scheduledAt = scheduledAt;
    this.expiresAt = expiresAt;
    this.sentAt = sentAt;
    this.readAt = readAt;
    this.createdAt = createdAt;
  }
}