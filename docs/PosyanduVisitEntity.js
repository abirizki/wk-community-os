/**
 * @class PosyanduVisitEntity
 * @description Represents a single visit by a child to a Posyandu session.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PosyanduVisitEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the visit.
   * @param {string} params.childCitizenId - The citizen ID of the child.
   * @param {string} params.posyanduScheduleId - The ID of the Posyandu schedule/event.
   * @param {string} params.visitDate - ISO 8601 date of the visit.
   * @param {number} params.weightKg - Child's weight in kilograms.
   * @param {number} params.heightCm - Child's height in centimeters.
   * @param {number} [params.headCircumferenceCm] - Child's head circumference in cm.
   * @param {string[]} [params.immunizationsGiven] - Array of immunization codes given during this visit.
   * @param {string[]} [params.vitaminsGiven] - Array of vitamin codes given (e.g., 'VITAMIN_A_RED').
   * @param {string} [params.notes] - Notes from the health worker.
   * @param {string} params.recordedBy - The user ID of the health worker.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    childCitizenId,
    posyanduScheduleId,
    visitDate,
    weightKg,
    heightCm,
    headCircumferenceCm,
    immunizationsGiven,
    vitaminsGiven,
    notes,
    recordedBy,
    createdAt
  }) {
    this.id = id;
    this.childCitizenId = childCitizenId;
    this.posyanduScheduleId = posyanduScheduleId;
    this.visitDate = visitDate;
    this.weightKg = weightKg;
    this.heightCm = heightCm;
    this.headCircumferenceCm = headCircumferenceCm || null;
    this.immunizationsGiven = immunizationsGiven || [];
    this.vitaminsGiven = vitaminsGiven || [];
    this.notes = notes || null;
    this.recordedBy = recordedBy;
    this.createdAt = createdAt;
  }
}