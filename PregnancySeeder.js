/**
 * @class PregnancySeeder
 * @description Seeds the database with initial lookup data for the Pregnancy package.
 */
class PregnancySeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('PregnancySeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Pregnancy package.
   */
  run() {
    this.logger.info('Running seeder for Pregnancy package...');
    try {
      this._seedPregnancyStatus();
      this._seedPregnancyOutcomes();
      this._seedPregnancyRiskStatus();
      this.logger.info('Pregnancy package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Pregnancy seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   */
  _seedPregnancyStatus() {
    const values = [
      { code: 'PLANNED', value: 'Planned' },
      { code: 'ACTIVE', value: 'Active' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'ENDED', value: 'Ended' }, // For miscarriage, termination, etc.
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('PREGNANCY_STATUS', values);
  }

  /**
   * @private
   */
  _seedPregnancyOutcomes() {
    const values = [
      { code: 'LIVE_BIRTH', value: 'Live Birth' },
      { code: 'STILLBIRTH', value: 'Stillbirth' },
      { code: 'MISCARRIAGE', value: 'Miscarriage' },
      { code: 'TERMINATION', value: 'Termination' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('PREGNANCY_OUTCOME', values);
  }

  /**
   * @private
   */
  _seedPregnancyRiskStatus() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'MONITORING', value: 'Monitoring' },
      { code: 'HIGH_RISK', value: 'High Risk' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('PREGNANCY_RISK_STATUS', values);
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