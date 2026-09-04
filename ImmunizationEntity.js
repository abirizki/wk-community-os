/**
 * @class ImmunizationRecord
 * @classdesc Represents a single immunization administration record for a citizen.
 */
class ImmunizationRecord {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.vaccineId = data.vaccineId;
    this.vaccineName = data.vaccineName; // Denormalized for convenience
    this.doseNumber = data.doseNumber;
    this.administrationDate = data.administrationDate;
    this.administrationTime = data.administrationTime || null;
    this.administrationStatus = data.administrationStatus || 'SCHEDULED';
    this.providerId = data.providerId || null;
    this.providerType = data.providerType || null;
    this.locationId = data.locationId || null;
    this.locationType = data.locationType || null;
    this.batchNumber = data.batchNumber || null;
    this.nextDoseDate = data.nextDoseDate || null;
    this.contextType = data.contextType || null; // e.g., 'POSYANDU', 'ANC', 'SCHOOL_CAMPAIGN'
    this.contextId = data.contextId || null; // e.g., ID of the PosyanduVisit or ANCRecord
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
      vaccineId: this.vaccineId,
      vaccineName: this.vaccineName,
      doseNumber: this.doseNumber,
      administrationDate: this.administrationDate,
      administrationTime: this.administrationTime,
      administrationStatus: this.administrationStatus,
      providerId: this.providerId,
      providerType: this.providerType,
      locationId: this.locationId,
      locationType: this.locationType,
      batchNumber: this.batchNumber,
      nextDoseDate: this.nextDoseDate,
      contextType: this.contextType,
      contextId: this.contextId,
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
   * @returns {ImmunizationRecord|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    data.notes = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
    return new ImmunizationRecord(data);
  }
}