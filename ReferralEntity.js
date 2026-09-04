/**
 * @class Referral
 * @classdesc Represents a single referral transaction for a citizen.
 */
class Referral {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.referralNumber = data.referralNumber || null;
    this.referralType = data.referralType || 'INTERNAL';
    this.referralStatus = data.referralStatus || 'DRAFT';
    this.priority = data.priority || 'NORMAL';
    this.referralDate = data.referralDate;
    this.sourceType = data.sourceType; // e.g., 'MEDICAL_RECORD', 'ANC_RECORD'
    this.sourceId = data.sourceId;
    this.destinationType = data.destinationType; // e.g., 'HEALTH_FACILITY', 'SPECIALIST'
    this.destinationId = data.destinationId; // ID from MasterData
    this.destinationReference = data.destinationReference || null; // e.g., Puskesmas Kebonjati
    this.reason = data.reason;
    this.notes = data.notes || [];
    this.referringProviderId = data.referringProviderId;
    this.referringProviderType = data.referringProviderType;
    this.receivingProviderId = data.receivingProviderId || null;
    this.receivingProviderType = data.receivingProviderType || null;
    this.followUpDate = data.followUpDate || null;
    this.followUpStatus = data.followUpStatus || 'PENDING';
    this.followUpNotes = data.followUpNotes || null;
    this.completedAt = data.completedAt || null;
    this.completedBy = data.completedBy || null;
    this.cancelledAt = data.cancelledAt || null;
    this.cancelledBy = data.cancelledBy || null;
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
      referralNumber: this.referralNumber,
      referralType: this.referralType,
      referralStatus: this.referralStatus,
      priority: this.priority,
      referralDate: this.referralDate,
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      destinationType: this.destinationType,
      destinationId: this.destinationId,
      destinationReference: this.destinationReference,
      reason: this.reason,
      notes: JSON.stringify(this.notes),
      referringProviderId: this.referringProviderId,
      referringProviderType: this.referringProviderType,
      receivingProviderId: this.receivingProviderId,
      receivingProviderType: this.receivingProviderType,
      followUpDate: this.followUpDate,
      followUpStatus: this.followUpStatus,
      followUpNotes: this.followUpNotes,
      completedAt: this.completedAt,
      completedBy: this.completedBy,
      cancelledAt: this.cancelledAt,
      cancelledBy: this.cancelledBy,
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
   * @returns {Referral|null}
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
    return new Referral(data);
  }
}