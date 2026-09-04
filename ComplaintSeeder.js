/**
 * @class ComplaintSeeder
 * @description Seeds the database with initial lookup data for the Complaint package.
 */
class ComplaintSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('ComplaintSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Complaint package.
   */
  run() {
    this.logger.info('Running seeder for Complaint package...');
    try {
      this._seedComplaintCategories();
      this._seedComplaintPriorities();
      this._seedComplaintStatuses();
      this.logger.info('Complaint package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Complaint seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedComplaintCategories() {
    const values = [
      { code: 'INFRASTRUCTURE', value: 'Infrastruktur' },
      { code: 'PUBLIC_SERVICE', value: 'Layanan Publik' },
      { code: 'ENVIRONMENT', value: 'Lingkungan' },
      { code: 'SOCIAL', value: 'Sosial & Ketertiban' },
      { code: 'OTHER', value: 'Lain-lain' },
    ];
    this._seedLookup('COMPLAINT_CATEGORY', values);
  }

  /** @private */
  _seedComplaintPriorities() {
    const values = [
      { code: 'LOW', value: 'Rendah' },
      { code: 'MEDIUM', value: 'Sedang' },
      { code: 'HIGH', value: 'Tinggi' },
      { code: 'URGENT', value: 'Mendesak' },
    ];
    this._seedLookup('COMPLAINT_PRIORITY', values);
  }

  /** @private */
  _seedComplaintStatuses() {
    const values = [
      { code: 'SUBMITTED', value: 'Diajukan' },
      { code: 'IN_REVIEW', value: 'Dalam Tinjauan' },
      { code: 'ASSIGNED', value: 'Ditugaskan' },
      { code: 'RESOLVED', value: 'Terselesaikan' },
      { code: 'REJECTED', value: 'Ditolak' },
      { code: 'CLOSED', value: 'Ditutup' },
      { code: 'CANCELLED', value: 'Dibatalkan' },
      { code: 'REOPENED', value: 'Dibuka Kembali' },
    ];
    this._seedLookup('COMPLAINT_STATUS', values);
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