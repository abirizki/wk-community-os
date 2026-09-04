/**
 * @class HealthMigration
 * @description Handles database schema migrations for the Health package.
 */
class HealthMigration {
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
   * Applies the migration changes to create the health_profiles table.
   */
  static up() {
    const logger = WK.logger('HealthMigration.up');
    logger.info('Running migration for Health package...');

    const db = WK.database();
    const tableName = 'health_profiles';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true, unique: true },
        { name: 'bloodType', type: 'string' },
        { name: 'rhesus', type: 'string' },
        { name: 'healthStatus', type: 'string', default: 'UNKNOWN' },
        { name: 'diseaseHistory', type: 'text' },
        { name: 'allergies', type: 'text' },
        { name: 'disabilities', type: 'text' },
        { name: 'medicalNotes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'healthStatus');
      db.ensureIndex(tableName, 'bloodType');
      db.ensureIndex(tableName, 'createdAt');
      db.ensureIndex(tableName, 'updatedAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the health_profiles table.
   */
  static down() {
    const logger = WK.logger('HealthMigration.down');
    logger.warn(`Executing destructive down migration for Health package.`);

    const db = WK.database();
    const tableName = 'health_profiles';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}