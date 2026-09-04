/**
 * @file PBBEntity.js
 * @description Core Domain Entities for the PBB (Pajak Bumi dan Bangunan) Tax Management module.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 * @blueprint DOC-016
 */

const crypto = require('crypto');

class PBBConstants {
  /**
   * Kategori Objek Pajak Bumi dan Bangunan.
   */
  static get PBB_OBJECT_CATEGORIES() {
    return ['PERUMAHAN', 'KOMERSIAL', 'INDUSTRI'];
  }

  /**
   * Status Tagihan SPPT Tahunan.
   */
  static get PBB_STATUSES() {
    return ['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'OVERDUE'];
  }
}

class PBBObject {
  /**
   * @param {Object} data - Partial or full PBBObject payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.nop = data.nop || ''; // NOP 18 Digit
    this.taxpayerCitizenId = data.taxpayerCitizenId || ''; // FK → Citizen.id (NIK)
    this.taxpayerName = data.taxpayerName || '';
    this.objectAddress = data.objectAddress || '';
    this.landAreaSqm = data.landAreaSqm !== undefined ? Number(data.landAreaSqm) : 0;
    this.buildingAreaSqm = data.buildingAreaSqm !== undefined ? Number(data.buildingAreaSqm) : 0;
    this.njopTotal = data.njopTotal !== undefined ? Number(data.njopTotal) : 0;
    this.category = data.category || 'PERUMAHAN';

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      nop: this.nop,
      taxpayerCitizenId: this.taxpayerCitizenId,
      taxpayerName: this.taxpayerName,
      objectAddress: this.objectAddress,
      landAreaSqm: this.landAreaSqm,
      buildingAreaSqm: this.buildingAreaSqm,
      njopTotal: this.njopTotal,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new PBBObject(data);
  }
}

class PBBBill {
  /**
   * @param {Object} data - Partial or full PBBBill payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.nop = data.nop || ''; // FK → PBBObject.nop
    this.taxYear = data.taxYear !== undefined ? Number(data.taxYear) : new Date().getFullYear();
    this.taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : 0;
    this.dueDate = data.dueDate || '';
    this.status = data.status || 'UNPAID';
    this.paymentDate = data.paymentDate || null;
    this.arrearsAmount = data.arrearsAmount !== undefined ? Number(data.arrearsAmount) : 0;

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      nop: this.nop,
      taxYear: this.taxYear,
      taxAmount: this.taxAmount,
      dueDate: this.dueDate,
      status: this.status,
      paymentDate: this.paymentDate,
      arrearsAmount: this.arrearsAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new PBBBill(data);
  }
}

class PBBPayment {
  /**
   * @param {Object} data - Partial or full PBBPayment payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.billId = data.billId || ''; // FK → PBBBill.id
    this.nop = data.nop || '';       // FK → PBBObject.nop
    this.paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : 0;
    this.paymentProofUrl = data.paymentProofUrl || '';
    this.notes = data.notes || null;
    this.verifiedBy = data.verifiedBy || null; // FK → Citizen.id (NIK Verifikator)
    this.verifiedAt = data.verifiedAt || null;

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      billId: this.billId,
      nop: this.nop,
      paidAmount: this.paidAmount,
      paymentProofUrl: this.paymentProofUrl,
      notes: this.notes,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new PBBPayment(data);
  }
}

module.exports = {
  PBBConstants,
  PBBObject,
  PBBBill,
  PBBPayment,
};

