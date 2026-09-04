/**
 * @file FinancialEntity.js
 * @description Core Domain Entities for the Financial (Iuran & Kas) module.
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

const crypto = require('crypto');

class FinancialConstants {
  static get DUES_STATUSES() {
    return ['PENDING', 'PAID', 'OVERDUE', 'WAIVED'];
  }

  static get DUES_TERMINAL_STATUSES() {
    return ['PAID', 'WAIVED'];
  }

  static get TRANSACTION_TYPES() {
    return ['INCOME', 'EXPENSE'];
  }

  static get TRANSACTION_CATEGORIES() {
    return [
      // INCOME categories
      'IURAN_BULANAN',
      'IURAN_KEAMANAN',
      'DONASI',
      'SUBSIDI_RW',
      'LAINNYA_MASUK',
      // EXPENSE categories
      'OPERASIONAL',
      'KEAMANAN',
      'KEBERSIHAN',
      'PEMBANGUNAN',
      'SOSIAL_KEMASYARAKATAN',
      'LAINNYA_KELUAR',
    ];
  }

  static get INCOME_CATEGORIES() {
    return ['IURAN_BULANAN', 'IURAN_KEAMANAN', 'DONASI', 'SUBSIDI_RW', 'LAINNYA_MASUK'];
  }

  static get EXPENSE_CATEGORIES() {
    return ['OPERASIONAL', 'KEAMANAN', 'KEBERSIHAN', 'PEMBANGUNAN', 'SOSIAL_KEMASYARAKATAN', 'LAINNYA_KELUAR'];
  }
}

class DuesBill {
  /**
   * @param {Object} data - Partial or full DuesBill payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.familyId = data.familyId || ''; // FK → Family.id (No. KK 16 digit)
    this.period = data.period || '';     // Format: YYYY-MM (e.g. '2026-09')
    this.amount = data.amount !== undefined ? data.amount : 0;
    this.status = data.status || 'PENDING';
    this.paidAt = data.paidAt || null;
    this.paidByUserId = data.paidByUserId || null;
    this.notes = data.notes || null;

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
      familyId: this.familyId,
      period: this.period,
      amount: this.amount,
      status: this.status,
      paidAt: this.paidAt,
      paidByUserId: this.paidByUserId,
      notes: this.notes,
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
    return new DuesBill(data);
  }
}

class CashTransaction {
  /**
   * @param {Object} data - Partial or full CashTransaction payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.type = data.type || 'INCOME';          // INCOME | EXPENSE
    this.category = data.category || 'LAINNYA_MASUK';
    this.amount = data.amount !== undefined ? Math.abs(data.amount) : 0; // Always positive
    this.description = data.description || '';
    this.referenceId = data.referenceId || null; // Optional FK → DuesBill.id
    this.transactionDate = data.transactionDate || new Date().toISOString().slice(0, 10);
    this.recordedByUserId = data.recordedByUserId || '';

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
      type: this.type,
      category: this.category,
      amount: this.amount,
      description: this.description,
      referenceId: this.referenceId,
      transactionDate: this.transactionDate,
      recordedByUserId: this.recordedByUserId,
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
    return new CashTransaction(data);
  }
}

module.exports = {
  FinancialConstants,
  DuesBill,
  CashTransaction,
};

