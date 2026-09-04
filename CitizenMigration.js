/**
 * @class CitizenMigration
 * @description Handles database schema migrations for the Citizen package.
 */
class CitizenMigration {
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
   * Applies the migration changes to create the citizens table.
   */
  static up() {
    const logger = WK.logger('CitizenMigration.up');
    logger.info('Running migration for Citizen package...');

    const db = WK.database();
    const tableName = 'citizens';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'NIK', type: 'string', notNull: true, unique: true },
        { name: 'KKNumber', type: 'string' },
        { name: 'fullName', type: 'string', notNull: true },
        { name: 'dateOfBirth', type: 'date', notNull: true },
        { name: 'placeOfBirth', type: 'string' },
        { name: 'gender', type: 'string' },
        { name: 'religion', type: 'string' },
        { name: 'educationLevel', type: 'string' },
        { name: 'occupation', type: 'string' },
        { name: 'maritalStatus', type: 'string' },
        { name: 'rt', type: 'string', notNull: true },
        { name: 'rw', type: 'string', notNull: true },
        { name: 'addressLine', type: 'text' },
        { name: 'phoneNumber', type: 'string' },
        { name: 'status', type: 'string', default: 'ACTIVE' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'NIK', { unique: true });
      db.ensureIndex(tableName, 'KKNumber');
      db.ensureIndex(tableName, 'fullName');
      db.ensureIndex(tableName, 'rt');
      db.ensureIndex(tableName, 'rw');
      db.ensureIndex(tableName, 'status');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the citizens table.
   */
  static down() {
    const logger = WK.logger('CitizenMigration.down');
    logger.warn(`Executing destructive down migration for Citizen package.`);

    const db = WK.database();
    const tableName = 'citizens';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}