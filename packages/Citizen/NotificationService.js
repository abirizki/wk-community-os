/**
 * @class NotificationService
 * @description The core service for creating and managing notifications. It subscribes
 * to the EventBus and orchestrates the notification generation and queueing process.
 */
class NotificationService {
  /**
   * @param {NotificationQueue} queue
   * @param {NotificationTemplate} templateService
   * @param {NotificationPreference} preferenceService
   */
  constructor(queue, templateService, preferenceService) {
    /** @private */
    this.queue = queue;
    /** @private */
    this.templateService = templateService;
    /** @private */
    this.preferenceService = preferenceService;

    this._subscribeToEvents();
  }

  /**
   * Subscribes to relevant events from the EventBus.
   * @private
   */
  _subscribeToEvents() {
    const eventBus = WK.service('eventbus');
    if (eventBus) {
      // Subscribe to a wide range of events that should trigger notifications
      eventBus.subscribe('Letter.Approved', (event) => this.handleEvent(event));
      eventBus.subscribe('Letter.Rejected', (event) => this.handleEvent(event));
      eventBus.subscribe('Workflow.Completed', (event) => this.handleEvent(event));
      eventBus.subscribe('Complaint.Resolved', (event) => this.handleEvent(event));
      // ... and many others
      WK.logger().info('NotificationService subscribed to EventBus.');
    } else {
      WK.logger().warn('EventBus service not found. NotificationService will not be event-driven.');
    }
  }

  /**
   * The primary event handler that processes events from the EventBus.
   * @param {EventEntity} event - The event object from the EventBus.
   */
  handleEvent(event) {
    WK.logger().info(`Handling event '${event.eventType}' to generate notification.`);
    try {
      // 1. Get the notification template for this event type
      const template = this.templateService.getTemplateForEvent(event.eventType);
      if (!template) {
        WK.logger().warn(`No notification template found for event type: ${event.eventType}`);
        return;
      }

      // 2. Determine the recipient(s)
      const recipients = this._determineRecipients(event, template);

      // 3. For each recipient, create and queue notifications for their preferred channels
      recipients.forEach(recipientId => {
        const content = this.templateService.render(template, event.payload);
        const preferences = this.preferenceService.getChannelsForUser(recipientId, event.eventType);

        preferences.forEach(channel => {
          this.createAndQueue({
            recipientId: recipientId,
            channel: channel,
            priority: template.priority,
            type: event.eventType,
            title: content.title,
            body: content.body,
            metadata: {
              referenceId: event.referenceId,
              actionUrl: content.actionUrl // The template can generate a dynamic URL
            }
          });
        });
      });
    } catch (e) {
      WK.logger().error(`Error handling event '${event.eventType}': ${e.message}`, e.stack);
    }
  }

  /**
   * Creates a NotificationEntity and adds it to the processing queue.
   * @param {object} data - The data for the notification.
   */
  createAndQueue(data) {
    const notification = new NotificationEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      ...data
    });

    this.queue.enqueue(notification);
    WK.logger().info(`Queued notification ${notification.id} for recipient ${notification.recipientId} on channel ${notification.channel}.`);
  }

  /**
   * Determines the recipient(s) for a notification based on the event and template.
   * @private
   */
  _determineRecipients(event, template) {
    // This logic can be complex. For example, for 'Letter.Approved', the recipient
    // is the citizen who requested it. For 'Complaint.New', it's the relevant RT/RW.
    if (template.recipient === 'EVENT_SUBJECT') {
      // e.g., the citizen who created the letter
      return [event.payload.citizenId];
    }
    // ... more logic to determine recipients based on role, area, etc.
    return [];
  }
}