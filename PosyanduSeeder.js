/**
 * @class PosyanduSeeder
 * @description Seeds the database with initial lookup data for the Posyandu package.
 */
class PosyanduSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('PosyanduSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Posyandu package.
   */
  run() {
    this.logger.info('Running seeder for Posyandu package...');
    try {
      this._seedNutritionStatus();
      this._seedDevelopmentStatus();
      this._seedVitaminTypes();
      this._seedImmunizationStatus();
      this.logger.info('Posyandu package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Posyandu seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   */
  _seedNutritionStatus() {
    const values = [
      { code: 'GOOD', value: 'Good' },
      { code: 'UNDERWEIGHT', value: 'Underweight' },
      { code: 'OVERWEIGHT', value: 'Overweight' },
      { code: 'SEVERELY_UNDERWEIGHT', value: 'Severely Underweight' },
      { code: 'OBESITY', value: 'Obesity' },
    ];
    this._seedLookup('POSYANDU_NUTRITION_STATUS', values);
  }

  /**
   * @private
   */
  _seedDevelopmentStatus() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'NEEDS_MONITORING', value: 'Needs Monitoring' },
      { code: 'DELAYED', value: 'Delayed' },
    ];
    this._seedLookup('POSYANDU_DEVELOPMENT_STATUS', values);
  }

  /**
   * @private
   */
  _seedVitaminTypes() {
    const values = [
      { code: 'VITAMIN_A', value: 'Vitamin A' },
      { code: 'VITAMIN_B', value: 'Vitamin B Complex' },
      { code: 'VITAMIN_C', value: 'Vitamin C' },
      { code: 'VITAMIN_D', value: 'Vitamin D' },
    ];
    this._seedLookup('VITAMIN_TYPE', values);
  }

  /**
   * @private
   */
  _seedImmunizationStatus() {
    const values = [
      { code: 'COMPLETE', value: 'Complete' },
      { code: 'INCOMPLETE', value: 'Incomplete' },
      { code: 'DUE', value: 'Due' },
      { code: 'FOLLOW_UP_REQUIRED', value: 'Follow-up Required' },
    ];
    this._seedLookup('IMMUNIZATION_STATUS', values);
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