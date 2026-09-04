/**
 * @class Letter
 * @classdesc Represents a single official letter document generated as a result of an administrative service request.
 */
class Letter {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.administrativeServiceId = data.administrativeServiceId; // Link to the originating request
    this.citizenId = data.citizenId; // Denormalized for easier querying
    this.familyId = data.familyId || null; // Denormalized for easier querying
    this.letterType = data.letterType; // e.g., 'SURAT_PENGANTAR', 'SKTM'
    this.letterNumber = data.letterNumber || null; // Official, generated letter number
    this.letterStatus = data.letterStatus || 'DRAFT'; // e.g., 'DRAFT', 'PENDING_SIGNATURE', 'ISSUED', 'EXPIRED', 'REVOKED'
    this.templateId = data.templateId; // ID of the document template used
    this.content = data.content || null; // The generated content of the letter, potentially as JSON or HTML
    this.issueDate = data.issueDate || null;
    this.issuedBy = data.issuedBy || null; // User ID of the issuer (e.g., RT/RW head)
    this.expiryDate = data.expiryDate || null;
    this.revocationReason = data.revocationReason || null;
    this.qrCodeId = data.qrCodeId || null; // Reference to a generated QR code for verification

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
      administrativeServiceId: this.administrativeServiceId,
      citizenId: this.citizenId,
      familyId: this.familyId,
      letterType: this.letterType,
      letterNumber: this.letterNumber,
      letterStatus: this.letterStatus,
      templateId: this.templateId,
      content: typeof this.content === 'object' ? JSON.stringify(this.content) : this.content,
      issueDate: this.issueDate,
      issuedBy: this.issuedBy,
      expiryDate: this.expiryDate,
      revocationReason: this.revocationReason,
      qrCodeId: this.qrCodeId,
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
   * @returns {Letter|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    try {
      if (data.content && typeof data.content === 'string') {
        data.content = JSON.parse(data.content);
      }
    } catch (e) {
      // Content is not a valid JSON string, leave as is.
    }
    return new Letter(data);
  }
}