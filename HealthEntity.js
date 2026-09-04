/**
 * @class HealthEntity
 * @classdesc Represents the core health profile of a citizen.
 * @property {string} id - The unique identifier for the health profile.
 * @property {string} citizenId - The ID of the citizen this profile belongs to.
 * @property {string|null} bloodType - The citizen's blood type (A, B, AB, O).
 * @property {string|null} rhesus - The citizen's rhesus factor (+ or -).
 * @property {string[]} diseaseHistory - A list of significant past or chronic illnesses.
 * @property {string[]} allergies - A list of known allergies.
 * @property {string[]} disabilities - A list of any physical or mental disabilities.
 * @property {object[]} medicalNotes - A list of timestamped medical notes.
 * @property {string} medicalNotes.note - The content of the medical note.
 * @property {string} medicalNotes.authorId - The ID of the user who wrote the note.
 * @property {string} medicalNotes.createdAt - The ISO timestamp when the note was created.
 * @property {string} healthStatus - The general health status (e.g., 'GOOD', 'UNDER_OBSERVATION', 'CRITICAL').
 * @property {string} createdAt - The ISO timestamp when the record was created.
 * @property {string} updatedAt - The ISO timestamp when the record was last updated.
 * @property {string} createdBy - The ID of the user who created the record.
 * @property {string} updatedBy - The ID of the user who last updated the record.
 */
class HealthEntity {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId;
    this.bloodType = data.bloodType || null;
    this.rhesus = data.rhesus || null;
    this.diseaseHistory = data.diseaseHistory || [];
    this.allergies = data.allergies || [];
    this.disabilities = data.disabilities || [];
    this.medicalNotes = data.medicalNotes || [];
    this.healthStatus = data.healthStatus || 'UNKNOWN';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  /**
   * Returns a plain object representation of the entity, suitable for database insertion.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      bloodType: this.bloodType,
      rhesus: this.rhesus,
      diseaseHistory: JSON.stringify(this.diseaseHistory),
      allergies: JSON.stringify(this.allergies),
      disabilities: JSON.stringify(this.disabilities),
      medicalNotes: JSON.stringify(this.medicalNotes),
      healthStatus: this.healthStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }

  /**
   * Creates an entity instance from a database record.
   * @param {object} record - The database record.
   * @returns {HealthEntity}
   */
  static fromObject(record) {
    if (!record) return null;
    const data = { ...record };
    data.diseaseHistory = typeof record.diseaseHistory === 'string' ? JSON.parse(record.diseaseHistory) : record.diseaseHistory;
    data.allergies = typeof record.allergies === 'string' ? JSON.parse(record.allergies) : record.allergies;
    data.disabilities = typeof record.disabilities === 'string' ? JSON.parse(record.disabilities) : record.disabilities;
    data.medicalNotes = typeof record.medicalNotes === 'string' ? JSON.parse(record.medicalNotes) : record.medicalNotes;
    return new HealthEntity(data);
  }
}