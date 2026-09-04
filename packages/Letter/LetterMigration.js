/**
 * @file LetterMigration.js
 * @description Database migration for the Letter (Surat Pengantar) module with absolute idempotency.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

class LetterMigration {
  static migrationVersion() {
    return '1.0.0';
  }

  static seedRequired() {
    return true;
  }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    if (!db.hasTable('letters')) {
      db.createTable('letters', {
        id: { type: 'string', primaryKey: true },
        citizenId: { type: 'string', required: true },
        familyId: { type: 'string', required: true },
        type: { type: 'string', required: true },
        purpose: { type: 'text', required: true },
        status: { type: 'string', default: 'DRAFT' },
        letterNumber: { type: 'string', nullable: true },
        attachments: { type: 'text', nullable: true },
        rejectedReason: { type: 'text', nullable: true },
        approvedByRtId: { type: 'string', nullable: true },
        approvedByRwId: { type: 'string', nullable: true },
        approvedByKelId: { type: 'string', nullable: true },
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
        db.ensureIndex('letters', 'citizenId');
        db.ensureIndex('letters', 'familyId');
        db.ensureIndex('letters', 'type');
        db.ensureIndex('letters', 'status');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    if (db.hasTable('letters')) {
      db.dropTable('letters');
    }
  }
}

module.exports = { LetterMigration };

