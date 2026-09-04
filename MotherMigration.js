/**
 * @class MotherMigration
 * @description Handles database schema migrations for the Mother package.
 */
class MotherMigration {
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
   * Applies the migration changes to create the mother_profiles table.
   */
  static up() {
    const logger = WK.logger('MotherMigration.up');
    logger.info('Running migration for Mother package...');

    const db = WK.database();
    const tableName = 'mother_profiles';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true, unique: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'bloodType', type: 'string' },
        { name: 'rhesus', type: 'string' },
        { name: 'pregnancyStatus', type: 'string', default: 'NOT_PREGNANT' },
        { name: 'numberOfPregnancies', type: 'integer', default: 0 },
        { name: 'numberOfDeliveries', type: 'integer', default: 0 },
        { name: 'numberOfMiscarriages', type: 'integer', default: 0 },
        { name: 'numberOfLivingChildren', type: 'integer', default: 0 },
        { name: 'lastMenstrualPeriod', type: 'date' },
        { name: 'lastDeliveryDate', type: 'date' },
        { name: 'maternalRiskStatus', type: 'string', default: 'UNKNOWN' },
        { name: 'maternalNotes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'pregnancyStatus');
      db.ensureIndex(tableName, 'maternalRiskStatus');
      db.ensureIndex(tableName, 'lastMenstrualPeriod');
      db.ensureIndex(tableName, 'lastDeliveryDate');
      db.ensureIndex(tableName, 'createdAt');
      db.ensureIndex(tableName, 'updatedAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the mother_profiles table.
   */
  static down() {
    const logger = WK.logger('MotherMigration.down');
    logger.warn(`Executing destructive down migration for Mother package.`);

    const db = WK.database();
    const tableName = 'mother_profiles';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}