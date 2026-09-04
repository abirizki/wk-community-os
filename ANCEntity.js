/**
 * @class ANCRecord
 * @classdesc Represents a single Antenatal Care (ANC) encounter record.
 */
class ANCRecord {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.pregnancyId = data.pregnancyId;
    this.motherId = data.motherId;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.visitNumber = data.visitNumber;
    this.visitDate = data.visitDate;
    this.gestationalAgeWeeks = data.gestationalAgeWeeks || null;
    this.weight = data.weight || null;
    this.height = data.height || null;
    this.bloodPressureSystolic = data.bloodPressureSystolic || null;
    this.bloodPressureDiastolic = data.bloodPressureDiastolic || null;
    this.pulseRate = data.pulseRate || null;
    this.temperature = data.temperature || null;
    this.fundalHeight = data.fundalHeight || null;
    this.fetalHeartRate = data.fetalHeartRate || null;
    this.complaints = data.complaints || [];
    this.observations = data.observations || [];
    this.riskStatus = data.riskStatus || 'NORMAL';
    this.followUpRequired = data.followUpRequired || false;
    this.referralRequired = data.referralRequired || false;
    this.nextVisitDate = data.nextVisitDate || null;
    this.providerId = data.providerId || null;
    this.providerType = data.providerType || null;
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
      pregnancyId: this.pregnancyId,
      motherId: this.motherId,
      citizenId: this.citizenId,
      healthProfileId: this.healthProfileId,
      visitNumber: this.visitNumber,
      visitDate: this.visitDate,
      gestationalAgeWeeks: this.gestationalAgeWeeks,
      weight: this.weight,
      height: this.height,
      bloodPressureSystolic: this.bloodPressureSystolic,
      bloodPressureDiastolic: this.bloodPressureDiastolic,
      pulseRate: this.pulseRate,
      temperature: this.temperature,
      fundalHeight: this.fundalHeight,
      fetalHeartRate: this.fetalHeartRate,
      complaints: JSON.stringify(this.complaints),
      observations: JSON.stringify(this.observations),
      riskStatus: this.riskStatus,
      followUpRequired: this.followUpRequired,
      referralRequired: this.referralRequired,
      nextVisitDate: this.nextVisitDate,
      providerId: this.providerId,
      providerType: this.providerType,
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
   * @returns {ANCRecord|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    data.complaints = typeof record.complaints === 'string' ? JSON.parse(record.complaints) : record.complaints;
    data.observations = typeof record.observations === 'string' ? JSON.parse(record.observations) : record.observations;
    data.notes = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
    return new ANCRecord(data);
  }
}