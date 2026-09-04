/**
 * @class Medicine
 * @classdesc Represents a master record for a specific type of medicine.
 */
class Medicine {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.code = data.code; // National Drug Code or internal code
    this.name = data.name;
    this.genericName = data.genericName || null;
    this.brandName = data.brandName || null;
    this.medicineType = data.medicineType; // e.g., 'GENERIK', 'PATEN'
    this.dosageForm = data.dosageForm; // e.g., 'TABLET', 'SYRUP'
    this.strength = data.strength; // e.g., '500mg', '10mg/5ml'
    this.unit = data.unit; // e.g., 'Tablet', 'Bottle'
    this.category = data.category || null; // e.g., 'ANTIBIOTIC', 'ANALGESIC'
    this.manufacturer = data.manufacturer || null;
    this.description = data.description || null;
    this.status = data.status || 'ACTIVE'; // e.g., 'ACTIVE', 'INACTIVE'
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
      code: this.code,
      name: this.name,
      genericName: this.genericName,
      brandName: this.brandName,
      medicineType: this.medicineType,
      dosageForm: this.dosageForm,
      strength: this.strength,
      unit: this.unit,
      category: this.category,
      manufacturer: this.manufacturer,
      description: this.description,
      status: this.status,
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
   * @returns {Medicine|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new Medicine(record);
  }
}