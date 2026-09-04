/**
 * @file ComplaintMigration.js
 * @description Database migration for the Complaint (Pengaduan Warga) module with absolute idempotency.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

class ComplaintMigration {
  static migrationVersion() {
    return '1.0.0';
  }

  static seedRequired() {
    return true;
  }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    if (!db.hasTable('complaints')) {
      db.createTable('complaints', {
        id: { type: 'string', primaryKey: true },
        citizenId: { type: 'string', required: true },
        title: { type: 'string', required: true },
        description: { type: 'text', required: true },
        category: { type: 'string', required: true },
        priority: { type: 'string', required: true },
        location: { type: 'string', required: true },
        status: { type: 'string', default: 'NEW' },
        attachments: { type: 'text', nullable: true },
        isAnonymous: { type: 'boolean', default: false },
        assignedOfficerId: { type: 'string', nullable: true },
        resolutionEvidence: { type: 'text', nullable: true },
        resolutionNotes: { type: 'text', nullable: true },
        rejectedReason: { type: 'text', nullable: true },
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
        db.ensureIndex('complaints', 'citizenId');
        db.ensureIndex('complaints', 'category');
        db.ensureIndex('complaints', 'priority');
        db.ensureIndex('complaints', 'status');
        db.ensureIndex('complaints', 'assignedOfficerId');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    if (db.hasTable('complaints')) {
      db.dropTable('complaints');
    }
  }
}

module.exports = { ComplaintMigration };

