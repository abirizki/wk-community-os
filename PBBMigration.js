/**
 * @class PBBMigration
 * @description Handles database schema migrations for the PBB package.
 */
class PBBMigration {
  /**
   * Returns the version of this migration.
   * @returns {string}
   */
  static migrationVersion() {
    return '1.0.0';
  }

  /**
   * Indicates if a seeder should be run after this migration.
   * @returns {boolean}
   */
  static seedRequired() {
    return true;
  }

  /**
   * Applies the migration changes to create the pbb table.
   */
  static up() {
    const logger = WK.logger('PBBMigration.up');
    logger.info('Running migration for PBB package...');

    const db = WK.database();
    const tableName = 'pbb';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'spptId', type: 'string', notNull: true, unique: true },
        { name: 'nop', type: 'string', notNull: true, index: true },
        { name: 'citizenId', type: 'string', notNull: true, index: true },
        { name: 'taxpayerName', type: 'string', notNull: true },
        { name: 'taxObjectAddress', type: 'text' },
        { name: 'rt', type: 'string', notNull: true, index: true },
        { name: 'rw', type: 'string', notNull: true, index: true },
        { name: 'landArea', type: 'number', notNull: true, default: 0 },
        { name: 'buildingArea', type: 'number', notNull: true, default: 0 },
        { name: 'njop', type: 'string', notNull: true },
        { name: 'taxYear', type: 'number', notNull: true, index: true },
        { name: 'taxAmount', type: 'number', notNull: true, default: 0 },
        { name: 'dueDate', type: 'datetime', notNull: true },
        { name: 'paymentStatus', type: 'string', notNull: true, default: 'BELUM LUNAS', index: true },
        { name: 'paymentDate', type: 'datetime' },
        { name: 'paymentProof', type: 'string' },
        { name: 'arrearsAmount', type: 'number', notNull: true, default: 0 },
        { name: 'objectCategory', type: 'string', notNull: true, default: 'LAINNYA', index: true },
        { name: 'verifiedBy', type: 'string' },
        { name: 'verificationNotes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', notNull: true, default: 1 },
      ]);

      db.ensureIndex(tableName, 'taxpayerName');
      db.ensureIndex(tableName, 'landArea');
      db.ensureIndex(tableName, 'buildingArea');
      db.ensureIndex(tableName, 'dueDate');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the pbb table.
   */
  static down() {
    const logger = WK.logger('PBBMigration.down');
    logger.warn(`Executing destructive down migration for PBB package.`);

    const db = WK.database();
    const tableName = 'pbb';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}

module.exports = PBBMigration;
