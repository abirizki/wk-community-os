/**
 * @class MedicalRecordSeeder
 * @description Seeds the database with initial lookup data for the MedicalRecord package.
 */
class MedicalRecordSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('MedicalRecordSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the MedicalRecord package.
   */
  run() {
    this.logger.info('Running seeder for MedicalRecord package...');
    try {
      this._seedRecordTypes();
      this._seedRecordStatuses();
      this.logger.info('MedicalRecord package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`MedicalRecord seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   * Seeds operational types for medical records.
   * The idempotent check prevents duplication.
   */
  _seedRecordTypes() {
    const values = [
      { code: 'CONSULTATION', value: 'Consultation' },
      { code: 'EXAMINATION', value: 'Examination' },
      { code: 'TREATMENT', value: 'Treatment' },
      { code: 'FOLLOW_UP', value: 'Follow-up' },
      { code: 'EMERGENCY', value: 'Emergency' },
      { code: 'SCREENING', value: 'Screening' },
      { code: 'REFERRAL_FOLLOW_UP', value: 'Referral Follow-up' },
      { code: 'OTHER', value: 'Other' },
    ];
    this._seedLookup('MEDICAL_RECORD_TYPE', values);
  }

  /**
   * @private
   * Seeds operational statuses for medical records.
   * The idempotent check prevents duplication.
   */
  _seedRecordStatuses() {
    const values = [
      { code: 'DRAFT', value: 'Draft' },
      { code: 'OPEN', value: 'Open' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'CANCELLED', value: 'Cancelled' },
      { code: 'ARCHIVED', value: 'Archived' },
    ];
    this._seedLookup('MEDICAL_RECORD_STATUS', values);
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