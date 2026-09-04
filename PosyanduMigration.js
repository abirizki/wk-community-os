/**
 * @class PosyanduMigration
 * @description Handles database schema migrations for the Posyandu package.
 */
class PosyanduMigration {
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
   * Applies the migration changes to create the posyandu_visits table.
   */
  static up() {
    const logger = WK.logger('PosyanduMigration.up');
    logger.info('Running migration for Posyandu package...');

    const db = WK.database();
    const tableName = 'posyandu_visits';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'visitDate', type: 'date', notNull: true },
        { name: 'posyanduLocation', type: 'string' },
        { name: 'rt', type: 'string' },
        { name: 'rw', type: 'string' },
        { name: 'weight', type: 'decimal' },
        { name: 'height', type: 'decimal' },
        { name: 'headCircumference', type: 'decimal' },
        { name: 'upperArmCircumference', type: 'decimal' },
        { name: 'bodyTemperature', type: 'decimal' },
        { name: 'bloodPressure', type: 'string' }, // Stored as "systolic/diastolic"
        { name: 'nutritionStatus', type: 'string' },
        { name: 'developmentStatus', type: 'string' },
        { name: 'vitaminGiven', type: 'text' },
        { name: 'immunizationStatus', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'nextVisitDate', type: 'date' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, ['citizenId', 'visitDate'], { unique: true });
      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'rt');
      db.ensureIndex(tableName, 'rw');
      db.ensureIndex(tableName, 'nutritionStatus');
      db.ensureIndex(tableName, 'developmentStatus');
      db.ensureIndex(tableName, 'createdAt');
      db.ensureIndex(tableName, 'updatedAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the posyandu_visits table.
   */
  static down() {
    const logger = WK.logger('PosyanduMigration.down');
    logger.warn(`Executing destructive down migration for Posyandu package.`);

    const db = WK.database();
    const tableName = 'posyandu_visits';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}