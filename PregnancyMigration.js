/**
 * @class PregnancyMigration
 * @description Handles database schema migrations for the Pregnancy package.
 */
class PregnancyMigration {
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
   * Applies the migration changes to create the pregnancy_episodes table.
   */
  static up() {
    const logger = WK.logger('PregnancyMigration.up');
    logger.info('Running migration for Pregnancy package...');

    const db = WK.database();
    const tableName = 'pregnancy_episodes';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'motherId', type: 'string', notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'pregnancyNumber', type: 'integer' },
        { name: 'status', type: 'string', default: 'PLANNED' },
        { name: 'startDate', type: 'date', notNull: true },
        { name: 'estimatedDueDate', type: 'date' },
        { name: 'actualEndDate', type: 'date' },
        { name: 'pregnancyOutcome', type: 'string' },
        { name: 'gestationalAgeWeeks', type: 'integer' },
        { name: 'riskStatus', type: 'string', default: 'NORMAL' },
        { name: 'gravida', type: 'integer' },
        { name: 'para', type: 'integer' },
        { name: 'abortus', type: 'integer' },
        { name: 'livingChildren', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'motherId');
      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'status');
      db.ensureIndex(tableName, 'riskStatus');
      db.ensureIndex(tableName, 'startDate');
      db.ensureIndex(tableName, 'estimatedDueDate');
      db.ensureIndex(tableName, 'actualEndDate');
      db.ensureIndex(tableName, 'createdAt');

      // Index to optimize finding active pregnancy for a mother
      db.ensureIndex(tableName, ['motherId', 'status']);

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the pregnancy_episodes table.
   */
  static down() {
    const logger = WK.logger('PregnancyMigration.down');
    logger.warn(`Executing destructive down migration for Pregnancy package.`);

    const db = WK.database();
    const tableName = 'pregnancy_episodes';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}