/**
 * @class Family
 * @classdesc Represents a single family unit or household (Kartu Keluarga - KK).
 */
class Family {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.KKNumber = data.KKNumber; // Family Card Number (Nomor Kartu Keluarga)
    this.headOfFamilyCitizenId = data.headOfFamilyCitizenId;
    this.rt = data.rt;
    this.rw = data.rw;
    this.addressLine = data.addressLine || null;
    this.status = data.status || 'ACTIVE'; // e.g., 'ACTIVE', 'INACTIVE', 'MERGED'
    /**
     * @type {Array<{citizenId: string, relationship: string}>}
     * @description List of family members. Relationship e.g., 'KEPALA_KELUARGA', 'ISTRI', 'ANAK'.
     */
    this.members = data.members || [];
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
      KKNumber: this.KKNumber,
      headOfFamilyCitizenId: this.headOfFamilyCitizenId,
      rt: this.rt,
      rw: this.rw,
      addressLine: this.addressLine,
      status: this.status,
      members: JSON.stringify(this.members), // Store as JSON string in the database
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
   * @returns {Family|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    try {
      // Safely parse the members JSON string
      data.members = typeof record.members === 'string' ? JSON.parse(record.members) : (record.members || []);
    } catch (e) {
      data.members = []; // Default to empty array on parse error
    }
    return new Family(data);
  }
}