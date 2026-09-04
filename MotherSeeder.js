/**
 * @class MotherSeeder
 * @description Seeds the database with initial lookup data for the Mother package.
 */
class MotherSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('MotherSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Mother package.
   */
  run() {
    this.logger.info('Running seeder for Mother package...');
    try {
      this._seedPregnancyStatus();
      this._seedMaternalRiskStatus();
      this.logger.info('Mother package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Mother seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   */
  _seedPregnancyStatus() {
    const values = [
      { code: 'NOT_PREGNANT', value: 'Not Pregnant' },
      { code: 'PREGNANT', value: 'Pregnant' },
      { code: 'POSTPARTUM', value: 'Postpartum' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('PREGNANCY_STATUS', values);
  }

  /**
   * @private
   */
  _seedMaternalRiskStatus() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'MONITORING', value: 'Monitoring' },
      { code: 'HIGH_RISK', value: 'High Risk' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('MATERNAL_RISK_STATUS', values);
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
        this.db.create(this.lookupTableName, {
          id: Utilities.getUuid(),
          type: lookupType,
          code: item.code,
          value: item.value,
          isActive: true,
        });
        this.logger.info(`Seeded ${lookupType}: ${item.code}`);
      }
    });
  }
}