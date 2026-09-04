/**
 * @file CitizenMigration.js
 * @description Database migration for the Citizen module (P30) — absolute idempotency.
 */

class CitizenMigration {
  static migrationVersion() { return '1.0.0'; }
  static seedRequired() { return true; }

  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;

    if (!db.hasTable('administrative_regions')) {
      db.createTable('administrative_regions', {
        id: { type: 'string', primaryKey: true },
        name: { type: 'string' },
        level: { type: 'string' },
        parentId: { type: 'string', nullable: true },
        createdAt: { type: 'datetime' }, updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true }, updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true }, deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 }
      });
      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('administrative_regions', 'level');
        db.ensureIndex('administrative_regions', 'parentId');
      }
    }

    if (!db.hasTable('families')) {
      db.createTable('families', {
        id: { type: 'string', primaryKey: true },
        regionId: { type: 'string' }, address: { type: 'text' },
        headOfFamilyId: { type: 'string', nullable: true },
        createdAt: { type: 'datetime' }, updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true }, updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true }, deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 }
      });
      if (typeof db.ensureIndex === 'function') db.ensureIndex('families', 'regionId');
    }

    if (!db.hasTable('citizens')) {
      db.createTable('citizens', {
        id: { type: 'string', primaryKey: true },
        familyId: { type: 'string' }, fullName: { type: 'string' },
        birthDate: { type: 'date' }, gender: { type: 'string' },
        religion: { type: 'string' }, occupation: { type: 'string', nullable: true },
        maritalStatus: { type: 'string' }, familyRelation: { type: 'string' },
        residencyStatus: { type: 'string' },
        createdAt: { type: 'datetime' }, updatedAt: { type: 'datetime' },
        createdBy: { type: 'string', nullable: true }, updatedBy: { type: 'string', nullable: true },
        deletedAt: { type: 'datetime', nullable: true }, deletedBy: { type: 'string', nullable: true },
        version: { type: 'integer', default: 1 }
      });
      if (typeof db.ensureIndex === 'function') {
        db.ensureIndex('citizens', 'familyId');
        db.ensureIndex('citizens', 'residencyStatus');
      }
    }
  }

  static down() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return;
    if (db.hasTable('citizens')) db.dropTable('citizens');
    if (db.hasTable('families')) db.dropTable('families');
    if (db.hasTable('administrative_regions')) db.dropTable('administrative_regions');
  }
}

module.exports = { CitizenMigration };

