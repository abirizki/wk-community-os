/**
 * @class ANCSeeder
 * @description Seeds the database with initial lookup data for the ANC package.
 */
class ANCSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('ANCSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the ANC package.
   */
  run() {
    this.logger.info('Running seeder for ANC package...');
    try {
      this._seedAncRiskStatus();
      this._seedProviderTypes();
      this.logger.info('ANC package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`ANC seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   * Seeds operational risk statuses for ANC visits. These may overlap with
   * maternal risk statuses but are seeded here for package completeness.
   * The idempotent check prevents duplication.
   */
  _seedAncRiskStatus() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'MONITORING', value: 'Monitoring' },
      { code: 'HIGH_RISK', value: 'High Risk' },
      { code: 'UNKNOWN', value: 'Unknown' },
    ];
    this._seedLookup('ANC_RISK_STATUS', values);
  }

  /**
   * @private
   * Seeds common provider types. The idempotent check prevents duplication
   * if these are already defined globally.
   */
  _seedProviderTypes() {
    const values = [
      { code: 'MIDWIFE', value: 'Midwife' },
      { code: 'DOCTOR', value: 'Doctor' },
      { code: 'NURSE', value: 'Nurse' },
      { code: 'CADRE', value: 'Posyandu Cadre' },
    ];
    this._seedLookup('PROVIDER_TYPE', values);
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