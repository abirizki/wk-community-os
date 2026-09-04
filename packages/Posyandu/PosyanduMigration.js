/**
 * @file PosyanduMigration.js
 * @description Database migration for the Posyandu (Community Health) module with absolute idempotency.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

class PosyanduMigration {
  static migrationVersion() {
    return '1.0.0';
  }

  static seedRequired() {
    return true;
  }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // 1. Table: posyandu_members
    if (!db.hasTable('posyandu_members')) {
      db.createTable('posyandu_members', {
        id: { type: 'string', primaryKey: true },
        citizenId: { type: 'string', required: true },
        parentCitizenId: { type: 'string', nullable: true },
        targetGroup: { type: 'string', required: true },
        posyanduName: { type: 'string', required: true },
        dateOfBirth: { type: 'date', required: true },
        gender: { type: 'string', required: true },
        bloodType: { type: 'string', nullable: true },
        chronicDiseases: { type: 'text', nullable: true },
        hpht: { type: 'date', nullable: true },
        estimatedDueDate: { type: 'date', nullable: true },
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
        db.ensureIndex('posyandu_members', 'citizenId');
        db.ensureIndex('posyandu_members', 'parentCitizenId');
        db.ensureIndex('posyandu_members', 'targetGroup');
      }
    }

    // 2. Table: posyandu_records
    if (!db.hasTable('posyandu_records')) {
      db.createTable('posyandu_records', {
        id: { type: 'string', primaryKey: true },
        memberId: { type: 'string', required: true },
        visitDate: { type: 'date', required: true },
        ageInMonths: { type: 'integer', default: 0 },
        weightKg: { type: 'decimal', default: 0 },
        heightCm: { type: 'decimal', default: 0 },
        headCircumferenceCm: { type: 'decimal', nullable: true },
        armCircumferenceCm: { type: 'decimal', nullable: true },
        systolic: { type: 'integer', nullable: true },
        diastolic: { type: 'integer', nullable: true },
        bloodSugarMgDl: { type: 'integer', nullable: true },
        cholesterolMgDl: { type: 'integer', nullable: true },
        nutritionStatus: { type: 'string', nullable: true },
        stuntingStatus: { type: 'string', nullable: true },
        isHighRisk: { type: 'boolean', default: false },
        riskNotes: { type: 'text', nullable: true },
        vitaminOrPMT: { type: 'string', nullable: true },
        immunizationGiven: { type: 'string', nullable: true },
        status: { type: 'string', default: 'SCHEDULED' },
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
        db.ensureIndex('posyandu_records', 'memberId');
        db.ensureIndex('posyandu_records', 'visitDate');
        db.ensureIndex('posyandu_records', 'status');
        db.ensureIndex('posyandu_records', 'isHighRisk');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    // Drop in reverse relational order
    if (db.hasTable('posyandu_records')) {
      db.dropTable('posyandu_records');
    }
    if (db.hasTable('posyandu_members')) {
      db.dropTable('posyandu_members');
    }
  }
}

module.exports = { PosyanduMigration };

