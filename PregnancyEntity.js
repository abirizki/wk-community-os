/**
 * @class Pregnancy
 * @classdesc Represents a single pregnancy episode for a mother.
 * @property {string} id - The unique identifier for the pregnancy episode.
 * @property {string} motherId - The ID of the MotherProfile this pregnancy belongs to.
 * @property {string} citizenId - The ID of the citizen (female) this pregnancy belongs to.
 * @property {string} healthProfileId - The ID of the associated HealthProfile.
 * @property {number} pregnancyNumber - The sequence number of this pregnancy for the mother.
 * @property {string} status - Current status of the pregnancy (e.g., 'PLANNED', 'ACTIVE', 'COMPLETED', 'ENDED').
 * @property {string} startDate - ISO date string when the pregnancy started (e.g., LMP).
 * @property {string|null} estimatedDueDate - ISO date string of the estimated due date.
 * @property {string|null} actualEndDate - ISO date string of the actual end date of the pregnancy.
 * @property {string|null} pregnancyOutcome - The outcome of the pregnancy (e.g., 'LIVE_BIRTH', 'STILLBIRTH', 'MISCARRIAGE').
 * @property {number|null} gestationalAgeWeeks - Gestational age in weeks at a certain point or at end.
 * @property {string} riskStatus - Operational risk status (e.g., 'NORMAL', 'MONITORING', 'HIGH_RISK').
 * @property {number|null} gravida - Total number of pregnancies (including current).
 * @property {number|null} para - Total number of live births.
 * @property {number|null} abortus - Total number of miscarriages/abortions.
 * @property {number|null} livingChildren - Total number of living children.
 * @property {object[]} notes - A list of timestamped notes related to this pregnancy.
 * @property {string} notes.note - The content of the note.
 * @property {string} notes.authorId - The ID of the user who wrote the note.
 * @property {string} notes.createdAt - The ISO timestamp when the note was created.
 * @property {string} createdAt - The ISO timestamp when the record was created.
 * @property {string} updatedAt - The ISO timestamp when the record was last updated.
 * @property {string} createdBy - The ID of the user who created the record.
 * @property {string} updatedBy - The ID of the user who last updated the record.
 * @property {string|null} deletedAt - The ISO timestamp when the record was soft-deleted.
 * @property {string|null} deletedBy - The ID of the user who soft-deleted the record.
 * @property {number} version - Optimistic locking version.
 */
class Pregnancy {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.motherId = data.motherId;
    this.citizenId = data.citizenId;
    this.healthProfileId = data.healthProfileId;
    this.pregnancyNumber = data.pregnancyNumber;
    this.status = data.status || 'PLANNED';
    this.startDate = data.startDate;
    this.estimatedDueDate = data.estimatedDueDate || null;
    this.actualEndDate = data.actualEndDate || null;
    this.pregnancyOutcome = data.pregnancyOutcome || null;
    this.gestationalAgeWeeks = data.gestationalAgeWeeks || null;
    this.riskStatus = data.riskStatus || 'NORMAL';
    this.gravida = data.gravida || null;
    this.para = data.para || null;
    this.abortus = data.abortus || null;
    this.livingChildren = data.livingChildren || null;
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
      motherId: this.motherId,
      citizenId: this.citizenId,
      healthProfileId: this.healthProfileId,
      pregnancyNumber: this.pregnancyNumber,
      status: this.status,
      startDate: this.startDate,
      estimatedDueDate: this.estimatedDueDate,
      actualEndDate: this.actualEndDate,
      pregnancyOutcome: this.pregnancyOutcome,
      gestationalAgeWeeks: this.gestationalAgeWeeks,
      riskStatus: this.riskStatus,
      gravida: this.gravida,
      para: this.para,
      abortus: this.abortus,
      livingChildren: this.livingChildren,
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
   * @returns {Pregnancy|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    // Parse JSON strings back to objects/arrays
    data.notes = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
    return new Pregnancy(data);
  }
}