/**
 * @class HealthVisit
 * @classdesc Represents a single health visit or encounter for a citizen.
 */
class HealthVisit {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.visitDate = data.visitDate;
    this.visitTime = data.visitTime || null;
    this.visitType = data.visitType || 'GENERAL'; // e.g., 'POSYANDU', 'HOME_VISIT'
    this.visitStatus = data.visitStatus || 'COMPLETED'; // e.g., 'SCHEDULED', 'IN_PROGRESS', 'CANCELLED'
    this.visitContextType = data.visitContextType || null; // e.g., 'MEDICAL_RECORD', 'REFERRAL', 'ANC'
    this.visitContextId = data.visitContextId || null;
    this.locationId = data.locationId || null; // e.g., ID of Puskesmas, Posyandu location
    this.locationType = data.locationType || null; // e.g., 'PUSKESMAS', 'POSYANDU'
    this.providerId = data.providerId || null;
    this.providerType = data.providerType || null;
    this.reason = data.reason || null; // Reason for the visit
    this.notes = data.notes || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version || 1;
  }

  /**
   * Returns a plain object representation of the entity for database operations.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      healthProfileId: this.healthProfileId,
      visitDate: this.visitDate,
      visitTime: this.visitTime,
      visitType: this.visitType,
      visitStatus: this.visitStatus,
      visitContextType: this.visitContextType,
      visitContextId: this.visitContextId,
      locationId: this.locationId,
      locationType: this.locationType,
      providerId: this.providerId,
      providerType: this.providerType,
      reason: this.reason,
      notes: JSON.stringify(this.notes),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  /**
   * Creates an entity instance from a database record.
   * @param {object} record - The database record.
   * @returns {HealthVisit|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    try {
      data.notes = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
    } catch (e) {
      data.notes = [];
    }
    return new HealthVisit(data);
  }
}