/**
 * @class PosyanduScheduleEntity
 * @description Represents a scheduled Posyandu event.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PosyanduScheduleEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier.
   * @param {string} params.eventName - Name of the event (e.g., "Penimbangan Bulanan RW 01").
   * @param {string} params.eventDate - ISO 8601 date of the event.
   * @param {string} params.location - Location of the event.
   * @param {string} params.targetRw - The target RW for this schedule.
   * @param {string} params.createdBy - The user ID of the creator.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    eventName,
    eventDate,
    location,
    targetRw,
    createdBy,
    createdAt
  }) {
    this.id = id;
    this.eventName = eventName;
    this.eventDate = eventDate;
    this.location = location;
    this.targetRw = targetRw;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}