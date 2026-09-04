/**
 * @class PosyanduVisit
 * @classdesc Represents a single visit record at a Posyandu.
 */
class PosyanduVisit {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.visitDate = data.visitDate;
    this.posyanduLocation = data.posyanduLocation;
    this.rt = data.rt;
    this.rw = data.rw;
    this.weight = data.weight || null;
    this.height = data.height || null;
    this.headCircumference = data.headCircumference || null;
    this.upperArmCircumference = data.upperArmCircumference || null;
    this.bodyTemperature = data.bodyTemperature || null;
    this.bloodPressure = data.bloodPressure || null;
    this.nutritionStatus = data.nutritionStatus || 'UNKNOWN';
    this.developmentStatus = data.developmentStatus || 'UNKNOWN';
    this.vitaminGiven = data.vitaminGiven || [];
    this.immunizationStatus = data.immunizationStatus || 'INCOMPLETE';
    this.notes = data.notes || null;
    this.nextVisitDate = data.nextVisitDate || null;
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
      posyanduLocation: this.posyanduLocation,
      rt: this.rt,
      rw: this.rw,
      weight: this.weight,
      height: this.height,
      headCircumference: this.headCircumference,
      upperArmCircumference: this.upperArmCircumference,
      bodyTemperature: this.bodyTemperature,
      bloodPressure: this.bloodPressure,
      nutritionStatus: this.nutritionStatus,
      developmentStatus: this.developmentStatus,
      vitaminGiven: JSON.stringify(this.vitaminGiven),
      immunizationStatus: this.immunizationStatus,
      notes: this.notes,
      nextVisitDate: this.nextVisitDate,
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
   * @returns {PosyanduVisit|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    data.vitaminGiven = typeof record.vitaminGiven === 'string' ? JSON.parse(record.vitaminGiven) : record.vitaminGiven;
    return new PosyanduVisit(data);
  }
}