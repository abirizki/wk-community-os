/**
 * @class MedicalRecordMigration
 * @description Handles database schema migrations for the MedicalRecord package.
 */
class MedicalRecordMigration {
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
   * Applies the migration changes to create the medical_records table.
   */
  static up() {
    const logger = WK.logger('MedicalRecordMigration.up');
    logger.info('Running migration for MedicalRecord package...');

    const db = WK.database();
    const tableName = 'medical_records';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'recordNumber', type: 'string' },
        { name: 'recordDate', type: 'date', notNull: true },
        { name: 'recordTime', type: 'string' },
        { name: 'recordType', type: 'string', default: 'CONSULTATION' },
        { name: 'recordStatus', type: 'string', default: 'DRAFT' },
        { name: 'chiefComplaint', type: 'text' },
        { name: 'findings', type: 'text' },
        { name: 'diagnosis', type: 'text' },
        { name: 'treatment', type: 'text' },
        { name: 'prescription', type: 'text' },
        { name: 'clinicalNotes', type: 'text' },
        { name: 'providerId', type: 'string' },
        { name: 'providerType', type: 'string' },
        { name: 'locationId', type: 'string' },
        { name: 'locationType', type: 'string' },
        { name: 'contextType', type: 'string' },
        { name: 'contextId', type: 'string' },
        { name: 'followUpDate', type: 'date' },
        { name: 'followUpNotes', type: 'text' },
        { name: 'attachmentId', type: 'string' },
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
      db.ensureIndex(tableName, 'recordNumber');
      db.ensureIndex(tableName, 'recordDate');
      db.ensureIndex(tableName, 'recordType');
      db.ensureIndex(tableName, 'recordStatus');
      db.ensureIndex(tableName, 'providerId');
      db.ensureIndex(tableName, 'locationId');
      db.ensureIndex(tableName, 'contextId');
      db.ensureIndex(tableName, 'followUpDate');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the medical_records table.
   */
  static down() {
    const logger = WK.logger('MedicalRecordMigration.down');
    logger.warn(`Executing destructive down migration for MedicalRecord package.`);

    const db = WK.database();
    const tableName = 'medical_records';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}