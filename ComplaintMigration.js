/**
 * @class ComplaintMigration
 * @description Handles database schema migrations for the Complaint package.
 */
class ComplaintMigration {
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
   * Applies the migration changes to create the complaints table.
   */
  static up() {
    const logger = WK.logger('ComplaintMigration.up');
    logger.info('Running migration for Complaint package...');

    const db = WK.database();
    const tableName = 'complaints';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'familyId', type: 'string' },
        { name: 'subject', type: 'string', notNull: true },
        { name: 'description', type: 'text', notNull: true },
        { name: 'category', type: 'string', notNull: true },
        { name: 'priority', type: 'string', default: 'MEDIUM' },
        { name: 'status', type: 'string', default: 'SUBMITTED' },
        { name: 'workflowId', type: 'string' },
        { name: 'submissionDate', type: 'datetime', notNull: true },
        { name: 'assignedToId', type: 'string' },
        { name: 'assignedToType', type: 'string' },
        { name: 'resolutionNotes', type: 'text' },
        { name: 'resolutionDate', type: 'datetime' },
        { name: 'attachments', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'category');
      db.ensureIndex(tableName, 'status');
      db.ensureIndex(tableName, 'priority');
      db.ensureIndex(tableName, 'workflowId');
      db.ensureIndex(tableName, 'assignedToId');
      db.ensureIndex(tableName, 'submissionDate');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the complaints table.
   */
  static down() {
    const logger = WK.logger('ComplaintMigration.down');
    logger.warn(`Executing destructive down migration for Complaint package.`);

    const db = WK.database();
    const tableName = 'complaints';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}