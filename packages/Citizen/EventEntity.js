/**
 * @class EventEntity
 * @description Represents the standard structure for any event published within the WK Community OS.
 * This entity is immutable once created.
 *
 * @see WK_EVENT_ENGINE.md - Event Payload Standard
 */
class EventEntity {
  /**
   * @param {object} params - The parameters to create an event entity.
   * @param {string} params.eventId - Unique identifier (UUID) for this event.
   * @param {string} params.eventType - The name of the event (e.g., 'Citizen.Created').
   * @param {string} params.module - The name of the module that published the event.
   * @param {string} params.referenceId - The ID of the business entity this event is about (e.g., Citizen ID).
   * @param {object} params.user - The user context { id, role } that triggered the event.
   * @param {string} params.timestamp - ISO 8601 timestamp of when the event occurred.
   * @param {string} params.priority - Processing priority ('HIGH', 'MEDIUM', 'LOW').
   * @param {object} params.payload - The data associated with the event.
   * @param {string} params.source - The source of the event (e.g., 'UI', 'API', 'Scheduler').
   * @param {string} params.correlationId - ID to group related events in a single business transaction.
   * @param {string} params.traceId - ID to trace a request through the entire system.
   * @param {string} [params.status='PENDING'] - The status of the event in the queue.
   */
  constructor({
    eventId,
    eventType,
    module,
    referenceId,
    user,
    timestamp,
    priority = 'MEDIUM',
    payload,
    source,
    correlationId,
    traceId,
    status = 'PENDING'
  }) {
    this.eventId = eventId;
    this.eventType = eventType;
    this.module = module;
    this.referenceId = referenceId;
    this.user = user;
    this.timestamp = timestamp;
    this.priority = priority;
    this.payload = payload;
    this.source = source;
    this.correlationId = correlationId;
    this.traceId = traceId;
    this.status = status; // e.g., PENDING, PROCESSING, COMPLETED, FAILED

    // Freeze the object to make it immutable
    Object.freeze(this);
    Object.freeze(this.payload);
    Object.freeze(this.user);
  }
}