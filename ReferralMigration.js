/**
 * @class ReferralMigration
 * @description Handles database schema migrations for the Referral package.
 */
class ReferralMigration {
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
   * Applies the migration changes to create the referrals table.
   */
  static up() {
    const logger = WK.logger('ReferralMigration.up');
    logger.info('Running migration for Referral package...');

    const db = WK.database();
    const tableName = 'referrals';

    if (db.hasTable(tableName)) {
      logger.warn(`Table '${tableName}' already exists. Skipping creation.`);
      return;
    }

    try {
      db.createTable(tableName, [
        { name: 'id', type: 'string', primaryKey: true, notNull: true },
        { name: 'citizenId', type: 'string', notNull: true },
        { name: 'healthProfileId', type: 'string' },
        { name: 'referralNumber', type: 'string' },
        { name: 'referralType', type: 'string', default: 'INTERNAL' },
        { name: 'referralStatus', type: 'string', default: 'DRAFT' },
        { name: 'priority', type: 'string', default: 'NORMAL' },
        { name: 'referralDate', type: 'date', notNull: true },
        { name: 'sourceType', type: 'string' },
        { name: 'sourceId', type: 'string' },
        { name: 'destinationType', type: 'string' },
        { name: 'destinationId', type: 'string' },
        { name: 'destinationReference', type: 'string' },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'referringProviderId', type: 'string' },
        { name: 'referringProviderType', type: 'string' },
        { name: 'receivingProviderId', type: 'string' },
        { name: 'receivingProviderType', type: 'string' },
        { name: 'followUpDate', type: 'date' },
        { name: 'followUpStatus', type: 'string', default: 'PENDING' },
        { name: 'followUpNotes', type: 'text' },
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
      db.ensureIndex(tableName, 'healthProfileId');
      db.ensureIndex(tableName, 'referralNumber');
      db.ensureIndex(tableName, 'referralStatus');
      db.ensureIndex(tableName, 'referralType');
      db.ensureIndex(tableName, 'priority');
      db.ensureIndex(tableName, 'referralDate');
      db.ensureIndex(tableName, ['sourceType', 'sourceId']);
      db.ensureIndex(tableName, ['destinationType', 'destinationId']);
      db.ensureIndex(tableName, 'followUpDate');
      db.ensureIndex(tableName, 'followUpStatus');
      db.ensureIndex(tableName, 'createdAt');

      logger.info(`Successfully created table and indexes for '${tableName}'.`);
    } catch (e) {
      logger.error(`Failed to run migration for '${tableName}': ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts the migration changes by dropping the referrals table.
   */
  static down() {
    const logger = WK.logger('ReferralMigration.down');
    logger.warn(`Executing destructive down migration for Referral package.`);

    const db = WK.database();
    const tableName = 'referrals';

    if (db.hasTable(tableName)) {
      db.dropTable(tableName);
      logger.info(`Successfully dropped table '${tableName}'.`);
    } else {
      logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
    }
  }
}