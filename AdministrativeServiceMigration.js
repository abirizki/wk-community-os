/**
 * @class AdministrativeServiceMigration
 * @description Handles database schema migrations for the AdministrativeService package.
 */
class AdministrativeServiceMigration {
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
   * Applies the migration changes to create the administrative_services table.
   */
  static up() {
    const logger = WK.logger('AdministrativeServiceMigration.up');
    logger.info('Running migration for AdministrativeService package...');

    const db = WK.database();
    const tableName = 'administrative_services';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'familyId', type: 'string' },
        { name: 'requestType', type: 'string', notNull: true },
        { name: 'requestNumber', type: 'string' },
        { name: 'requestDate', type: 'date', notNull: true },
        { name: 'submissionDate', type: 'date' },
        { name: 'requestStatus', type: 'string', default: 'DRAFT' },
        { name: 'priority', type: 'string', default: 'NORMAL' },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'attachments', type: 'text' },
        { name: 'rt', type: 'string', notNull: true },
        { name: 'rw', type: 'string', notNull: true },
        { name: 'rtVerificationStatus', type: 'string', default: 'PENDING' },
        { name: 'rtVerifierId', type: 'string' },
        { name: 'rtVerificationDate', type: 'datetime' },
        { name: 'rwVerificationStatus', type: 'string', default: 'PENDING' },
        { name: 'rwVerifierId', type: 'string' },
        { name: 'rwVerificationDate', type: 'datetime' },
        { name: 'kelurahanProcessingStatus', type: 'string', default: 'PENDING' },
        { name: 'kelurahanProcessorId', type: 'string' },
        { name: 'kelurahanProcessingDate', type: 'datetime' },
        { name: 'completedAt', type: 'datetime' },
        { name: 'completedBy', type: 'string' },
        { name: 'cancelledAt', type: 'datetime' },
        { name: 'cancelledBy', type: 'string' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'familyId');
      db.ensureIndex(tableName, 'requestType');
      db.ensureIndex(tableName, 'requestStatus');
      db.ensureIndex(tableName, 'requestNumber', { unique: true });
      db.ensureIndex(tableName, 'requestDate');
      db.ensureIndex(tableName, 'rt');
      db.ensureIndex(tableName, 'rw');
      db.ensureIndex(tableName, 'rtVerificationStatus');
      db.ensureIndex(tableName, 'rwVerificationStatus');
      db.ensureIndex(tableName, 'kelurahanProcessingStatus');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the administrative_services table.
   */
  static down() {
    const logger = WK.logger('AdministrativeServiceMigration.down');
    logger.warn(`Executing destructive down migration for AdministrativeService package.`);

    const db = WK.database();
    const tableName = 'administrative_services';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}