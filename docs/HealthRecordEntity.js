/**
 * @class HealthRecordEntity
 * @description Represents a single, time-series health event for a citizen.
 */
class HealthRecordEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the health record.
   * @param {string} params.citizenId - The ID of the citizen this record belongs to.
   * @param {string} params.recordType - The type of health event (e.g., 'VISIT', 'VACCINATION', 'PREGNANCY_CHECKUP', 'DIAGNOSIS').
   * @param {string} params.recordDate - ISO 8601 timestamp of when the event occurred.
   * @param {string} params.recordedBy - The ID of the user (e.g., health worker) who created the record.
   * @param {object} params.details - A JSON object containing specific details of the event.
   * @param {string} [params.referralId] - Optional ID of a related referral record.
   * @param {string} params.createdAt - ISO 8601 timestamp of when the record was created.
   */
  constructor({
    id,
    citizenId,
    recordType,
    recordDate,
    recordedBy,
    details,
    referralId,
    createdAt
  }) {
    if (!id || !citizenId || !recordType || !recordDate || !recordedBy) {
      throw new Error('Missing required parameters for HealthRecordEntity.');
    }

    this.id = id;
    this.citizenId = citizenId;
    this.recordType = recordType;
    this.recordDate = recordDate;
    this.recordedBy = recordedBy;
    this.details = details || {};
    this.referralId = referralId || null;
    this.createdAt = createdAt;
  }
}