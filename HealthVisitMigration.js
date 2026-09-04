/**
 * @class HealthVisitMigration
 * @description Handles database schema migrations for the HealthVisit package.
 */
class HealthVisitMigration {
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
   * Applies the migration changes to create the health_visits table.
   */
  static up() {
    const logger = WK.logger('HealthVisitMigration.up');
    logger.info('Running migration for HealthVisit package...');

    const db = WK.database();
    const tableName = 'health_visits';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string' },
        { name: 'visitDate', type: 'date', notNull: true },
        { name: 'visitTime', type: 'string' },
        { name: 'visitType', type: 'string', default: 'GENERAL' },
        { name: 'visitStatus', type: 'string', default: 'COMPLETED' },
        { name: 'visitContextType', type: 'string' },
        { name: 'visitContextId', type: 'string' },
        { name: 'locationId', type: 'string' },
        { name: 'locationType', type: 'string' },
        { name: 'providerId', type: 'string' },
        { name: 'providerType', type: 'string' },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'visitDate');
      db.ensureIndex(tableName, 'visitType');
      db.ensureIndex(tableName, 'visitStatus');
      db.ensureIndex(tableName, ['visitContextType', 'visitContextId']);
      db.ensureIndex(tableName, 'locationId');
      db.ensureIndex(tableName, 'providerId');
      db.ensureIndex(tableName, 'createdAt');

      // Index to optimize duplicate checks
      db.ensureIndex(tableName, ['citizenId', 'visitDate', 'visitType']);

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the health_visits table.
   */
  static down() {
    const logger = WK.logger('HealthVisitMigration.down');
    logger.warn(`Executing destructive down migration for HealthVisit package.`);

    const db = WK.database();
    const tableName = 'health_visits';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}