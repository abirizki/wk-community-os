/**
 * @class ImmunizationMigration
 * @description Handles database schema migrations for the Immunization package.
 */
class ImmunizationMigration {
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
   * Applies the migration changes to create the immunization_records table.
   */
  static up() {
    const logger = WK.logger('ImmunizationMigration.up');
    logger.info('Running migration for Immunization package...');

    const db = WK.database();
    const tableName = 'immunization_records';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'vaccineId', type: 'string', notNull: true },
        { name: 'vaccineName', type: 'string' },
        { name: 'doseNumber', type: 'integer', notNull: true },
        { name: 'administrationDate', type: 'date' },
        { name: 'administrationTime', type: 'string' },
        { name: 'administrationStatus', type: 'string', default: 'SCHEDULED' },
        { name: 'providerId', type: 'string' },
        { name: 'providerType', type: 'string' },
        { name: 'locationId', type: 'string' },
        { name: 'locationType', type: 'string' },
        { name: 'batchNumber', type: 'string' },
        { name: 'nextDoseDate', type: 'date' },
        { name: 'contextType', type: 'string' },
        { name: 'contextId', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, ['citizenId', 'vaccineId', 'doseNumber'], { unique: true });
      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'administrationDate');
      db.ensureIndex(tableName, 'administrationStatus');
      db.ensureIndex(tableName, 'nextDoseDate');
      db.ensureIndex(tableName, 'providerId');
      db.ensureIndex(tableName, 'locationId');
      db.ensureIndex(tableName, 'contextId');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the immunization_records table.
   */
  static down() {
    const logger = WK.logger('ImmunizationMigration.down');
    logger.warn(`Executing destructive down migration for Immunization package.`);

    const db = WK.database();
    const tableName = 'immunization_records';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}