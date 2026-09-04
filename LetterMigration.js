/**
 * @class LetterMigration
 * @description Handles database schema migrations for the Letter package.
 */
class LetterMigration {
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
   * Applies the migration changes to create the letters table.
   */
  static up() {
    const logger = WK.logger('LetterMigration.up');
    logger.info('Running migration for Letter package...');

    const db = WK.database();
    const tableName = 'letters';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'administrativeServiceId', type: 'string', notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'familyId', type: 'string' },
        { name: 'letterType', type: 'string', notNull: true },
        { name: 'letterNumber', type: 'string' },
        { name: 'letterStatus', type: 'string', default: 'DRAFT' },
        { name: 'templateId', type: 'string', notNull: true },
        { name: 'content', type: 'text' },
        { name: 'issueDate', type: 'date' },
        { name: 'issuedBy', type: 'string' },
        { name: 'expiryDate', type: 'date' },
        { name: 'revocationReason', type: 'text' },
        { name: 'qrCodeId', type: 'string' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, 'administrativeServiceId', { unique: true });
      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'familyId');
      db.ensureIndex(tableName, 'letterType');
      db.ensureIndex(tableName, 'letterNumber', { unique: true });
      db.ensureIndex(tableName, 'letterStatus');
      db.ensureIndex(tableName, 'issueDate');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the letters table.
   */
  static down() {
    const logger = WK.logger('LetterMigration.down');
    logger.warn(`Executing destructive down migration for Letter package.`);

    const db = WK.database();
    const tableName = 'letters';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}