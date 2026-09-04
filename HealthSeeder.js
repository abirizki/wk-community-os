/**
 * @class HealthSeeder
 * @description Seeds the database with initial data for the Health package.
 */
class HealthSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('HealthSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Health package.
   */
  run() {
    this.logger.info('Running seeder for Health package...');
    try {
      this._seedHealthStatusLookups();
      this._seedBloodTypeLookups();
      this.logger.info('Health package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Health seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   * Seeds the health status lookup values.
   */
  _seedHealthStatusLookups() {
    const statuses = ['HEALTHY', 'OBSERVATION', 'TREATMENT', 'RECOVERED', 'CRITICAL', 'UNKNOWN'];
    const lookupType = 'HEALTH_STATUS';

    this.logger.debug(`Seeding ${lookupType} lookups...`);
    statuses.forEach(status => {
      const exists = this.db.exists(this.lookupTableName, { type: lookupType, code: status });
      if (!exists) {
        this.db.create(this.lookupTableName, {
          id: Utilities.getUuid(),
          type: lookupType,
          code: status,
          value: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' '),
          isActive: true,
        });
        this.logger.info(`Seeded ${lookupType}: ${status}`);
      }
    });
  }

  /**
   * @private
   * Seeds the blood type and rhesus lookup values.
   */
  _seedBloodTypeLookups() {
    const bloodTypes = ['A', 'B', 'AB', 'O'];
    const rhesusTypes = [{ code: '+', value: 'Positive' }, { code: '-', value: 'Negative' }];

    this._seedLookup('BLOOD_TYPE', bloodTypes.map(bt => ({ code: bt, value: bt })));
    this._seedLookup('RHESUS_TYPE', rhesusTypes);
  }

  /**
   * @private
   * Generic helper to seed a lookup type idempotently.
   * @param {string} lookupType - The type of lookup to seed.
   * @param {object[]} values - An array of {code, value} objects.
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