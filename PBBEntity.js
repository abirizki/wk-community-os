/**
 * @class PBB
 * @classdesc Represents a Pajak Bumi dan Bangunan (PBB) / SPPT (Surat Pungutan Barang Tanah) record.
 * 
 * PBB (Pajak Bumi dan Bangunan) is a property tax imposed on land and building assets
 * owned by citizens and legal entities by the local government.
 * 
 * SPPT (Surat Pungutan Barang Tanah) is the tax collection slip issued for each taxable object.
 */
class PBB {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.spptId = data.spptId || Utilities.getUuid();
    this.nop = data.nop;
    this.citizenId = data.citizenId;
    this.taxpayerName = data.taxpayerName;
    this.taxObjectAddress = data.taxObjectAddress || '';
    this.rt = data.rt;
    this.rw = data.rw;
    this.landArea = data.landArea || 0;
    this.buildingArea = data.buildingArea || 0;
    this.njop = data.njop;
    this.taxYear = data.taxYear;
    this.taxAmount = data.taxAmount || 0;
    this.dueDate = data.dueDate;
    this.paymentStatus = data.paymentStatus || 'BELUM LUNAS';
    this.paymentDate = data.paymentDate || null;
    this.paymentProof = data.paymentProof || null;
    this.arrearsAmount = data.arrearsAmount || 0;
    this.objectCategory = data.objectCategory || 'LAINNYA';
    this.verifiedBy = data.verifiedBy || null;
    this.verificationNotes = data.verificationNotes || null;
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
      spptId: this.spptId,
      nop: this.nop,
      citizenId: this.citizenId,
      taxpayerName: this.taxpayerName,
      taxObjectAddress: this.taxObjectAddress,
      rt: this.rt,
      rw: this.rw,
      landArea: this.landArea,
      buildingArea: this.buildingArea,
      njop: this.njop,
      taxYear: this.taxYear,
      taxAmount: this.taxAmount,
      dueDate: this.dueDate,
      paymentStatus: this.paymentStatus,
      paymentDate: this.paymentDate,
      paymentProof: this.paymentProof,
      arrearsAmount: this.arrearsAmount,
      objectCategory: this.objectCategory,
      verifiedBy: this.verifiedBy,
      verificationNotes: this.verificationNotes,
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
   * @returns {PBB|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    return new PBB(data);
  }

  /**
   * Returns the entity in a display-ready format.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      spptId: this.spptId,
      nop: this.nop,
      taxpayerName: this.taxpayerName,
      address: this.taxObjectAddress,
      rt: this.rt,
      rw: this.rw,
      category: this.objectCategory,
      landArea: this.landArea,
      buildingArea: this.buildingArea,
      taxYear: this.taxYear,
      taxAmount: this.taxAmount,
      arrears: this.arrearsAmount,
      dueDate: this.dueDate,
      paymentStatus: this.paymentStatus,
      paymentProof: this.paymentProof,
      verifiedBy: this.verifiedBy,
      createdAt: this.createdAt,
    };
  }
}

// Additional helper class for PBB enums (used by Seeder and Validator)
class PBBConstants {
  /**
   * Valid PBB object categories.
   * @returns {string[]}
   */
  static get OBJECT_CATEGORIES() {
    return [
      'PERUMAHAN',
      'KOMERSIAL',
      'PERKANTORAN',
      'INDUSTRI',
      'SOSIAL',
      'LAINNYA'
    ];
  }

  /**
   * Valid PBB payment statuses.
   * @returns {string[]}
   */
  static get PAYMENT_STATUSES() {
    return [
      'BELUM LUNAS',
      'LUNAS',
      'MENUNGGAK'
    ];
  }
}

module.exports = { PBB, PBBConstants };
// Also export separately for backwards compatibility
PBBConstants.OBJECT_CATEGORIES;
PBBConstants.PAYMENT_STATUSES;
