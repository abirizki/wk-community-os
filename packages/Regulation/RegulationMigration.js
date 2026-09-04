/**
 * @file RegulationMigration.js
 * @description Handles database schema migrations and indexing for the Regulation module (Epic Governance / Package P22).
 */

class RegulationMigration {
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
   * Applies schema migrations to create regulations and regulation_articles tables.
   */
  static up() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('RegulationMigration.up')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) {
      if (logger.warn) logger.warn('Database adapter not available. Skipping RegulationMigration.up.');
      return;
    }

    if (logger.info) logger.info('Running migrations for Regulation package...');

    try {
      // 1. Table: regulations
      const regulationTable = 'regulations';
      if (!db.hasTable(regulationTable)) {
        db.createTable(regulationTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'regulationNumber', type: 'string', notNull: true },
          { name: 'title', type: 'string', notNull: true },
          { name: 'description', type: 'text' },
          { name: 'category', type: 'string', notNull: true, default: 'LAINNYA' },
          { name: 'scopeType', type: 'string', notNull: true, default: 'RT' },
          { name: 'scopeId', type: 'string', notNull: true },
          { name: 'decisionId', type: 'string' },
          { name: 'status', type: 'string', notNull: true, default: 'DRAFT' },
          { name: 'enactedDate', type: 'datetime' },
          { name: 'effectiveDate', type: 'datetime', notNull: true },
          { name: 'expiryDate', type: 'datetime' },
          { name: 'signatoryCitizenId', type: 'string' },
          { name: 'supersededByRegulationId', type: 'string' },
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
          db.ensureIndex(regulationTable, 'regulationNumber');
          db.ensureIndex(regulationTable, 'scopeId');
          db.ensureIndex(regulationTable, 'scopeType');
          db.ensureIndex(regulationTable, 'category');
          db.ensureIndex(regulationTable, 'decisionId');
          db.ensureIndex(regulationTable, 'status');
          db.ensureIndex(regulationTable, 'effectiveDate');
          db.ensureIndex(regulationTable, 'enactedDate');
          db.ensureIndex(regulationTable, 'signatoryCitizenId');
          db.ensureIndex(regulationTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${regulationTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${regulationTable}' already exists. Skipping creation.`);
      }

      // 2. Table: regulation_articles
      const articleTable = 'regulation_articles';
      if (!db.hasTable(articleTable)) {
        db.createTable(articleTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'regulationId', type: 'string', notNull: true },
          { name: 'chapter', type: 'string' },
          { name: 'articleNumber', type: 'integer', notNull: true, default: 1 },
          { name: 'title', type: 'string', notNull: true },
          { name: 'content', type: 'text', notNull: true },
          { name: 'sanctionDescription', type: 'text' },
          { name: 'displayOrder', type: 'integer', notNull: true, default: 1 },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(articleTable, 'regulationId');
          db.ensureIndex(articleTable, 'articleNumber');
          db.ensureIndex(articleTable, 'displayOrder');
          db.ensureIndex(articleTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${articleTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${articleTable}' already exists. Skipping creation.`);
      }

    } catch (e) {
      if (logger.error) logger.error(`Failed to run migration for Regulation package: ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts migration changes by dropping regulation tables in reverse dependency order.
   */
  static down() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('RegulationMigration.down')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) return;

    const tables = ['regulation_articles', 'regulations'];
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

module.exports = RegulationMigration;

