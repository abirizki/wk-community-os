/**
 * @class WorkflowMigration
 * @description Handles database schema migrations for the Workflow package.
 */
class WorkflowMigration {
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
   * Applies the migration changes to create the workflows table.
   */
  static up() {
    const logger = WK.logger('WorkflowMigration.up');
    logger.info('Running migration for Workflow package...');

    const db = WK.database();
    const tableName = 'workflows';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'definitionId', type: 'string', notNull: true },
        { name: 'contextType', type: 'string', notNull: true },
        { name: 'contextId', type: 'string', notNull: true },
        { name: 'status', type: 'string', default: 'IN_PROGRESS', notNull: true },
        { name: 'currentState', type: 'string', notNull: true },
        { name: 'previousState', type: 'string' },
        { name: 'assigneeId', type: 'string' },
        { name: 'assigneeType', type: 'string' },
        { name: 'history', type: 'text' }, // Stored as JSON string
        { name: 'variables', type: 'text' }, // Stored as JSON string
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'completedAt', type: 'datetime' },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'definitionId');
      db.ensureIndex(tableName, 'contextType');
      db.ensureIndex(tableName, 'contextId');
      db.ensureIndex(tableName, ['contextType', 'contextId']); // For findActiveByContext
      db.ensureIndex(tableName, 'status');
      db.ensureIndex(tableName, 'currentState');
      db.ensureIndex(tableName, 'assigneeId');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the workflows table.
   */
  static down() {
    const logger = WK.logger('WorkflowMigration.down');
    logger.warn(`Executing destructive down migration for Workflow package.`);

    const db = WK.database();
    const tableName = 'workflows';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}