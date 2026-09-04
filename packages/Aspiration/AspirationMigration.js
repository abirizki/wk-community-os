/**
 * @file AspirationMigration.js
 * @description Database migration for the Aspiration (Usulan & Musrenbang) module with absolute idempotency.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

class AspirationMigration {
  static migrationVersion() {
    return '1.0.0';
  }

  static seedRequired() {
    return true;
  }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // 1. Table: aspirations
    if (!db.hasTable('aspirations')) {
      db.createTable('aspirations', {
        id: { type: 'string', primaryKey: true },
        citizenId: { type: 'string', required: true },
        title: { type: 'string', required: true },
        description: { type: 'text', required: true },
        category: { type: 'string', required: true },
        estimatedBudget: { type: 'decimal', default: 0 },
        location: { type: 'string', required: true },
        status: { type: 'string', default: 'DRAFT' },
        priority: { type: 'string', default: 'LOW' },
        voteCount: { type: 'integer', default: 0 },
        pollingEndDate: { type: 'datetime', nullable: true },
        scheduledMeetingDate: { type: 'datetime', nullable: true },
        finalDecisionNotes: { type: 'text', nullable: true },
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
        db.ensureIndex('aspirations', 'citizenId');
        db.ensureIndex('aspirations', 'category');
        db.ensureIndex('aspirations', 'status');
        db.ensureIndex('aspirations', 'priority');
      }
    }

    // 2. Table: aspiration_votes (with unique constraint on aspirationId + citizenId)
    if (!db.hasTable('aspiration_votes')) {
      db.createTable('aspiration_votes', {
        id: { type: 'string', primaryKey: true },
        aspirationId: { type: 'string', required: true },
        citizenId: { type: 'string', required: true },
        votedAt: { type: 'datetime', required: true },
      });

      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('aspiration_votes', 'aspirationId');
        db.ensureIndex('aspiration_votes', 'citizenId');
        db.ensureIndex('aspiration_votes', 'aspirationId_citizenId_unique'); // Composite unique
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // Drop in reverse relational order
    if (db.hasTable('aspiration_votes')) {
      db.dropTable('aspiration_votes');
    }
    if (db.hasTable('aspirations')) {
      db.dropTable('aspirations');
    }
  }
}

module.exports = { AspirationMigration };

