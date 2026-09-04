/**
 * @class MotherProfile
 * @classdesc Represents the maternal-health profile of a female citizen.
 * @property {string} id - The unique identifier for the mother's profile.
 * @property {string} citizenId - The ID of the citizen this profile belongs to.
 * @property {string} healthProfileId - The ID of the associated HealthProfile.
 * @property {string|null} bloodType - The mother's blood type (A, B, AB, O).
 * @property {string|null} rhesus - The mother's rhesus factor (+ or -).
 * @property {string} pregnancyStatus - Current pregnancy status (e.g., 'NOT_PREGNANT', 'PREGNANT', 'POSTPARTUM').
 * @property {number} numberOfPregnancies - Total number of pregnancies.
 * @property {number} numberOfDeliveries - Total number of deliveries.
 * @property {number} numberOfMiscarriages - Total number of miscarriages.
 * @property {number} numberOfLivingChildren - Total number of living children.
 * @property {string|null} lastMenstrualPeriod - ISO date string of the last menstrual period.
 * @property {string|null} lastDeliveryDate - ISO date string of the last delivery.
 * @property {string} maternalRiskStatus - Current maternal risk status (e.g., 'NORMAL', 'MONITORING', 'HIGH_RISK', 'UNKNOWN').
 * @property {object[]} maternalNotes - A list of timestamped maternal notes.
 * @property {string} maternalNotes.note - The content of the note.
 * @property {string} maternalNotes.authorId - The ID of the user who wrote the note.
 * @property {string} maternalNotes.createdAt - The ISO timestamp when the note was created.
 * @property {string} createdAt - The ISO timestamp when the record was created.
 * @property {string} updatedAt - The ISO timestamp when the record was last updated.
 * @property {string} createdBy - The ID of the user who created the record.
 * @property {string} updatedBy - The ID of the user who last updated the record.
 * @property {string|null} deletedAt - The ISO timestamp when the record was soft-deleted.
 * @property {string|null} deletedBy - The ID of the user who soft-deleted the record.
 * @property {number} version - Optimistic locking version.
 */
class MotherProfile {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.bloodType = data.bloodType || null;
    this.rhesus = data.rhesus || null;
    this.pregnancyStatus = data.pregnancyStatus || 'NOT_PREGNANT';
    this.numberOfPregnancies = data.numberOfPregnancies || 0;
    this.numberOfDeliveries = data.numberOfDeliveries || 0;
    this.numberOfMiscarriages = data.numberOfMiscarriages || 0;
    this.numberOfLivingChildren = data.numberOfLivingChildren || 0;
    this.lastMenstrualPeriod = data.lastMenstrualPeriod || null;
    this.lastDeliveryDate = data.lastDeliveryDate || null;
    this.maternalRiskStatus = data.maternalRiskStatus || 'UNKNOWN';
    this.maternalNotes = data.maternalNotes || [];
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
      bloodType: this.bloodType,
      rhesus: this.rhesus,
      pregnancyStatus: this.pregnancyStatus,
      numberOfPregnancies: this.numberOfPregnancies,
      numberOfDeliveries: this.numberOfDeliveries,
      numberOfMiscarriages: this.numberOfMiscarriages,
      numberOfLivingChildren: this.numberOfLivingChildren,
      lastMenstrualPeriod: this.lastMenstrualPeriod,
      lastDeliveryDate: this.lastDeliveryDate,
      maternalRiskStatus: this.maternalRiskStatus,
      maternalNotes: JSON.stringify(this.maternalNotes),
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
   * @returns {MotherProfile|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    // Parse JSON strings back to objects/arrays
    data.maternalNotes = typeof record.maternalNotes === 'string' ? JSON.parse(record.maternalNotes) : record.maternalNotes;
    return new MotherProfile(data);
  }
}