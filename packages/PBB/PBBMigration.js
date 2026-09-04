/**
 * @file PBBMigration.js
 * @description Database migration for PBB Tax Management module with absolute idempotency.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

class PBBMigration {
  static migrationVersion() {
    return '1.0.0';
  }

  static seedRequired() {
    return true;
  }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // 1. Table: pbb_objects
    if (!db.hasTable('pbb_objects')) {
      db.createTable('pbb_objects', {
        id: { type: 'string', primaryKey: true },
        nop: { type: 'string', required: true, unique: true },
        taxpayerCitizenId: { type: 'string', required: true },
        taxpayerName: { type: 'string', required: true },
        objectAddress: { type: 'string', required: true },
        landAreaSqm: { type: 'integer', default: 0 },
        buildingAreaSqm: { type: 'integer', default: 0 },
        njopTotal: { type: 'decimal', default: 0 },
        category: { type: 'string', default: 'PERUMAHAN' },
        // WK Standard Audit Trail
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true },
        updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true },
        deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 },
      });

      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('pbb_objects', 'nop');
        db.ensureIndex('pbb_objects', 'taxpayerCitizenId');
      }
    }

    // 2. Table: pbb_bills
    if (!db.hasTable('pbb_bills')) {
      db.createTable('pbb_bills', {
        id: { type: 'string', primaryKey: true },
        nop: { type: 'string', required: true },
        taxYear: { type: 'integer', required: true },
        taxAmount: { type: 'decimal', default: 0 },
        dueDate: { type: 'date', required: true },
        status: { type: 'string', default: 'UNPAID' },
        paymentDate: { type: 'date', nullable: true },
        arrearsAmount: { type: 'decimal', default: 0 },
        // WK Standard Audit Trail
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true },
        updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true },
        deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 },
      });

      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('pbb_bills', 'nop');
        db.ensureIndex('pbb_bills', 'status');
        db.ensureIndex('pbb_bills', 'dueDate');
      }
    }

    // 3. Table: pbb_payments
    if (!db.hasTable('pbb_payments')) {
      db.createTable('pbb_payments', {
        id: { type: 'string', primaryKey: true },
        billId: { type: 'string', required: true },
        nop: { type: 'string', required: true },
        paidAmount: { type: 'decimal', default: 0 },
        paymentProofUrl: { type: 'string', required: true },
        notes: { type: 'text', nullable: true },
        verifiedBy: { type: 'string', nullable: true },
        verifiedAt: { type: 'datetime', nullable: true },
        // WK Standard Audit Trail
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true },
        updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true },
        deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 },
      });

      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('pbb_payments', 'billId');
        db.ensureIndex('pbb_payments', 'nop');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // Drop in reverse relational order
    if (db.hasTable('pbb_payments')) {
      db.dropTable('pbb_payments');
    }
    if (db.hasTable('pbb_bills')) {
      db.dropTable('pbb_bills');
    }
    if (db.hasTable('pbb_objects')) {
      db.dropTable('pbb_objects');
    }
  }
}

module.exports = { PBBMigration };

