/**
 * @class EventPublisher
 * @description Responsible for creating, validating, and queueing new events.
 */
class EventPublisher {
  /**
   * @param {EventQueue} queue
   * @param {EventRepository} repository
   */
  constructor(queue, repository) {
    /** @private */
    this.queue = queue;
    /** @private */
    this.repository = repository;
  }

  /**
   * Creates, validates, persists, and enqueues a new event.
   * @param {string} eventType - The name of the event.
   * @param {object} payload - The event data.
   * @param {object} [options={}] - Additional options.
   * @returns {EventEntity} The created event entity.
   */
  publish(eventType, payload, options = {}) {
    const user = WK.session().getUser() || { id: 'SYSTEM', role: 'SYSTEM' };
    const trace = WK.trace().getContext(); // Assumes a tracing service exists

    // 1. Create the Event Entity
    const eventData = {
      eventId: WK.helper().generateUuid(),
      eventType: eventType,
      module: options.module || 'UNKNOWN',
      referenceId: options.referenceId || null,
      user: { id: user.id, role: user.role },
      timestamp: new Date().toISOString(),
      priority: options.priority || 'MEDIUM',
      payload: payload,
      source: options.source || 'APPLICATION',
      correlationId: trace.correlationId,
      traceId: trace.traceId,
    };

    const event = new EventEntity(eventData);

    // 2. Validate the Event (basic validation)
    if (!event.eventType || !event.eventId) {
      throw new Error('Event validation failed: eventType and eventId are required.');
    }

    // 3. Persist the Event to the log/repository
    // This creates an immutable, auditable record *before* any processing happens.
    try {
      this.repository.create(event);
    } catch (e) {
      WK.logger().error(`Failed to persist event ${event.eventId} to repository: ${e.message}`, e.stack);
      // Depending on policy, we might still try to queue it.
      // For reliability, we'll throw here.
      throw new Error('Failed to persist event before queueing.');
    }

    // 4. Enqueue the Event for processing
    this.queue.enqueue(event);

    WK.logger().info(`Event published and queued. Type: ${event.eventType}, ID: ${event.eventId}`);
    return event;
  }
}