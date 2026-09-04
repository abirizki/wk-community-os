/**
 * @class EventService
 * @description The main public-facing service for the EventBus package.
 * It provides a simple interface for other modules to publish events and for
 * the system to process the event queue.
 */
class EventService {
  /**
   * @param {EventPublisher} publisher
   * @param {EventDispatcher} dispatcher
   * @param {EventQueue} queue
   */
  constructor(publisher, dispatcher, queue) {
    /** @private */
    this.publisher = publisher;
    /** @private */
    this.dispatcher = dispatcher;
    /** @private */
    this.queue = queue;
  }

  /**
   * Publishes a new event to the EventBus. This is the primary method
   * that other modules will call.
   * @param {string} eventType - The name of the event (e.g., 'Citizen.Created').
   * @param {object} payload - The data associated with the event.
   * @param {object} [options={}] - Optional parameters like referenceId, source, etc.
   * @returns {EventEntity} The created event entity.
   */
  publish(eventType, payload, options = {}) {
    try {
      return this.publisher.publish(eventType, payload, options);
    } catch (e) {
      WK.logger().error(`Failed to publish event '${eventType}': ${e.message}`, e.stack);
      // In a production system, this might go to a "failed to publish" queue.
      // For now, we just log the error.
      return null;
    }
  }

  /**
   * Processes a batch of events from the main queue. This method is intended
   * to be called by a time-based trigger (e.g., every 1 minute).
   * @param {number} [batchSize=10] - The maximum number of events to process in this run.
   */
  processQueue(batchSize = 10) {
    WK.logger().info(`Starting event queue processing for batch size: ${batchSize}`);
    let processedCount = 0;
    for (let i = 0; i < batchSize; i++) {
      const event = this.queue.dequeue();
      if (!event) {
        WK.logger().info('Event queue is empty. Processing finished.');
        break; // Queue is empty
      }

      this.dispatcher.dispatch(event);
      processedCount++;
    }
    WK.logger().info(`Event queue processing finished. Processed ${processedCount} events.`);
  }
}