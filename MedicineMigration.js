/**
 * @class MedicineMigration
 * @description Handles database schema migrations for the Medicine package.
 */
class MedicineMigration {
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
   * Applies the migration changes to create the medicines table.
   */
  static up() {
    const logger = WK.logger('MedicineMigration.up');
    logger.info('Running migration for Medicine package...');

    const db = WK.database();
    const tableName = 'medicines';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'code', type: 'string', notNull: true },
        { name: 'name', type: 'string', notNull: true },
        { name: 'genericName', type: 'string' },
        { name: 'brandName', type: 'string' },
        { name: 'medicineType', type: 'string' },
        { name: 'dosageForm', type: 'string', notNull: true },
        { name: 'strength', type: 'string', notNull: true },
        { name: 'unit', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'manufacturer', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'string', default: 'ACTIVE' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'code', { unique: true });
      db.ensureIndex(tableName, 'name');
      db.ensureIndex(tableName, 'genericName');
      db.ensureIndex(tableName, 'brandName');
      db.ensureIndex(tableName, 'medicineType');
      db.ensureIndex(tableName, 'dosageForm');
      db.ensureIndex(tableName, 'category');
      db.ensureIndex(tableName, 'status');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the medicines table.
   */
  static down() {
    const logger = WK.logger('MedicineMigration.down');
    logger.warn(`Executing destructive down migration for Medicine package.`);

    const db = WK.database();
    const tableName = 'medicines';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}