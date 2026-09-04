/**
 * @class ANCMigration
 * @description Handles database schema migrations for the ANC (Antenatal Care) package.
 */
class ANCMigration {
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
   * Applies the migration changes to create the anc_records table.
   */
  static up() {
    const logger = WK.logger('ANCMigration.up');
    logger.info('Running migration for ANC package...');

    const db = WK.database();
    const tableName = 'anc_records';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'pregnancyId', type: 'string', notNull: true },
        { name: 'motherId', type: 'string', notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string', notNull: true },
        { name: 'visitNumber', type: 'integer', notNull: true },
        { name: 'visitDate', type: 'date', notNull: true },
        { name: 'gestationalAgeWeeks', type: 'integer' },
        { name: 'weight', type: 'decimal' },
        { name: 'height', type: 'decimal' },
        { name: 'bloodPressureSystolic', type: 'integer' },
        { name: 'bloodPressureDiastolic', type: 'integer' },
        { name: 'pulseRate', type: 'integer' },
        { name: 'temperature', type: 'decimal' },
        { name: 'fundalHeight', type: 'decimal' },
        { name: 'fetalHeartRate', type: 'integer' },
        { name: 'complaints', type: 'text' },
        { name: 'observations', type: 'text' },
        { name: 'riskStatus', type: 'string', default: 'NORMAL' },
        { name: 'followUpRequired', type: 'boolean', default: false },
        { name: 'referralRequired', type: 'boolean', default: false },
        { name: 'nextVisitDate', type: 'date' },
        { name: 'providerId', type: 'string' },
        { name: 'providerType', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'createdAt', type: 'datetime', notNull: true },
        { name: 'updatedAt', type: 'datetime', notNull: true },
        { name: 'createdBy', type: 'string' },
        { name: 'updatedBy', type: 'string' },
        { name: 'deletedAt', type: 'datetime' },
        { name: 'deletedBy', type: 'string' },
        { name: 'version', type: 'integer', default: 1 },
      ]);

      db.ensureIndex(tableName, ['pregnancyId', 'visitNumber'], { unique: true });
      db.ensureIndex(tableName, 'motherId');
      db.ensureIndex(tableName, 'citizenId');
      db.ensureIndex(tableName, 'visitDate');
      db.ensureIndex(tableName, 'riskStatus');
      db.ensureIndex(tableName, 'followUpRequired');
      db.ensureIndex(tableName, 'referralRequired');
      db.ensureIndex(tableName, 'nextVisitDate');
      db.ensureIndex(tableName, 'providerId');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the anc_records table.
   */
  static down() {
    const logger = WK.logger('ANCMigration.down');
    logger.warn(`Executing destructive down migration for ANC package.`);

    const db = WK.database();
    const tableName = 'anc_records';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}