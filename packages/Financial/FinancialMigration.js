/**
 * @file FinancialMigration.js
 * @description Database migration for the Financial module (P40) — absolute idempotency.
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

class FinancialMigration {
  static migrationVersion() { return '1.0.0'; }
  static seedRequired() { return true; }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // 1. dues_bills
    if (!db.hasTable('dues_bills')) {
      db.createTable('dues_bills', {
        id: { type: 'string', primaryKey: true },         // UUID v4
        familyId: { type: 'string', required: true },      // FK → families.id
        period: { type: 'string', required: true },        // YYYY-MM
        amount: { type: 'decimal', required: true },
        status: { type: 'string', default: 'PENDING' },
        paidAt: { type: 'datetime', nullable: true },
        paidByUserId: { type: 'string', nullable: true },
        notes: { type: 'text', nullable: true },
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
        db.ensureIndex('dues_bills', 'familyId');
        db.ensureIndex('dues_bills', 'period');
        db.ensureIndex('dues_bills', 'status');
        db.ensureIndex('dues_bills', 'familyId_period_unique'); // composite unique
      }
    }

    // 2. cash_transactions
    if (!db.hasTable('cash_transactions')) {
      db.createTable('cash_transactions', {
        id: { type: 'string', primaryKey: true },          // UUID v4
        type: { type: 'string', required: true },          // INCOME | EXPENSE
        category: { type: 'string', required: true },
        amount: { type: 'decimal', required: true },
        description: { type: 'text', required: true },
        referenceId: { type: 'string', nullable: true },   // FK → dues_bills.id (nullable)
        transactionDate: { type: 'date', required: true },
        recordedByUserId: { type: 'string', required: true },
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
        db.ensureIndex('cash_transactions', 'type');
        db.ensureIndex('cash_transactions', 'category');
        db.ensureIndex('cash_transactions', 'referenceId');
        db.ensureIndex('cash_transactions', 'transactionDate');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // Drop in reverse relational order to avoid FK constraint issues
    if (db.hasTable('cash_transactions')) db.dropTable('cash_transactions');
    if (db.hasTable('dues_bills')) db.dropTable('dues_bills');
  }
}

module.exports = { FinancialMigration };

