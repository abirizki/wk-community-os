/**
 * @file DecisionMigration.js
 * @description Handles database schema migrations and indexing for the Decision module (Epic Governance / Package P21).
 */

class DecisionMigration {
  /**
   * Returns the migration version string.
   * @returns {string}
   */
  static migrationVersion() {
    return '1.0.0';
  }

  /**
   * Indicates if seeding is required after migration execution.
   * @returns {boolean}
   */
  static seedRequired() {
    return true;
  }

  /**
   * Applies schema migrations to create decisions and decision_impacts tables.
   */
  static up() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('DecisionMigration.up')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) {
      if (logger.warn) logger.warn('Database adapter not available. Skipping DecisionMigration.up.');
      return;
    }

    if (logger.info) logger.info('Running migrations for Decision package...');

    try {
      // 1. Table: decisions
      const decisionTable = 'decisions';
      if (!db.hasTable(decisionTable)) {
        db.createTable(decisionTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'decisionNumber', type: 'string', notNull: true },
          { name: 'meetingId', type: 'string', notNull: true },
          { name: 'agendaId', type: 'string' },
          { name: 'title', type: 'string', notNull: true },
          { name: 'content', type: 'text', notNull: true },
          { name: 'category', type: 'string', notNull: true, default: 'LAINNYA' },
          { name: 'scopeType', type: 'string', notNull: true, default: 'RT' },
          { name: 'scopeId', type: 'string', notNull: true },
          { name: 'status', type: 'string', notNull: true, default: 'DRAFT' },
          { name: 'effectiveDate', type: 'datetime', notNull: true },
          { name: 'expirationDate', type: 'datetime' },
          { name: 'signatoryCitizenId', type: 'string' },
          { name: 'supersededByDecisionId', type: 'string' },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(decisionTable, 'decisionNumber');
          db.ensureIndex(decisionTable, 'meetingId');
          db.ensureIndex(decisionTable, 'agendaId');
          db.ensureIndex(decisionTable, 'scopeId');
          db.ensureIndex(decisionTable, 'scopeType');
          db.ensureIndex(decisionTable, 'category');
          db.ensureIndex(decisionTable, 'status');
          db.ensureIndex(decisionTable, 'effectiveDate');
          db.ensureIndex(decisionTable, 'signatoryCitizenId');
          db.ensureIndex(decisionTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${decisionTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${decisionTable}' already exists. Skipping creation.`);
      }

      // 2. Table: decision_impacts
      const impactTable = 'decision_impacts';
      if (!db.hasTable(impactTable)) {
        db.createTable(impactTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'decisionId', type: 'string', notNull: true },
          { name: 'targetType', type: 'string', notNull: true, default: 'ALL_CITIZENS' },
          { name: 'targetScopeId', type: 'string', notNull: true },
          { name: 'description', type: 'text', notNull: true },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(impactTable, 'decisionId');
          db.ensureIndex(impactTable, 'targetType');
          db.ensureIndex(impactTable, 'targetScopeId');
          db.ensureIndex(impactTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${impactTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${impactTable}' already exists. Skipping creation.`);
      }

    } catch (e) {
      if (logger.error) logger.error(`Failed to run migration for Decision package: ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts migration changes by dropping decision tables in reverse dependency order.
   */
  static down() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('DecisionMigration.down')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) return;

    const tables = ['decision_impacts', 'decisions'];
    tables.forEach(tableName => {
      if (db.hasTable(tableName)) {
        db.dropTable(tableName);
        if (logger.info) logger.info(`Successfully dropped table '${tableName}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
      }
    });
  }
}

module.exports = DecisionMigration;

