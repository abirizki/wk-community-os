/**
 * @class ImmunizationSeeder
 * @description Seeds the database with initial lookup data for the Immunization package.
 */
class ImmunizationSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('ImmunizationSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Immunization package.
   */
  run() {
    this.logger.info('Running seeder for Immunization package...');
    try {
      this._seedAdministrationStatus();
      this._seedContextTypes();
      this.logger.info('Immunization package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Immunization seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   * Seeds operational statuses for immunization records.
   * The idempotent check prevents duplication.
   */
  _seedAdministrationStatus() {
    const values = [
      { code: 'SCHEDULED', value: 'Scheduled' },
      { code: 'ADMINISTERED', value: 'Administered' },
      { code: 'CANCELLED', value: 'Cancelled' },
      { code: 'MISSED', value: 'Missed' },
      { code: 'DEFERRED', value: 'Deferred' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('IMMUNIZATION_ADMIN_STATUS', values);
  }

  /**
   * @private
   * Seeds common context types for immunization administration.
   * The idempotent check prevents duplication.
   */
  _seedContextTypes() {
    const values = [
      { code: 'ROUTINE', value: 'Routine' },
      { code: 'POSYANDU', value: 'Posyandu Visit' },
      { code: 'ANC', value: 'ANC Visit' },
      { code: 'PREGNANCY', value: 'Pregnancy Context' },
      { code: 'SCHOOL', value: 'School Campaign' },
      { code: 'CAMPAIGN', value: 'Special Campaign' },
    ];
    this._seedLookup('IMMUNIZATION_CONTEXT_TYPE', values);
  }

  /**
   * @private
   * @param {string} lookupType
   * @param {object[]} values
   */
  _seedLookup(lookupType, values) {
    this.logger.debug(`Seeding ${lookupType} lookups...`);
    values.forEach(item => {
      if (!this.db.exists(this.lookupTableName, { type: lookupType, code: item.code })) {
        this.db.create(this.lookupTableName, { id: Utilities.getUuid(), type: lookupType, code: item.code, value: item.value, isActive: true });
        this.logger.info(`Seeded ${lookupType}: ${item.code}`);
      }
    });
  }
}