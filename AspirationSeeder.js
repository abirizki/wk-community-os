/**
 * @class AspirationSeeder
 * @description Seeds the database with initial lookup data for the Aspiration package.
 */
class AspirationSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('AspirationSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Aspiration package.
   */
  run() {
    this.logger.info('Running seeder for Aspiration package...');
    try {
      this._seedAspirationCategories();
      this._seedAspirationStatuses();
      this.logger.info('Aspiration package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Aspiration seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedAspirationCategories() {
    const values = [
      { code: 'INFRASTRUCTURE', value: 'Infrastruktur' },
      { code: 'PUBLIC_SERVICE', value: 'Layanan Publik' },
      { code: 'ENVIRONMENT', value: 'Lingkungan' },
      { code: 'EDUCATION', value: 'Pendidikan' },
      { code: 'SOCIAL', value: 'Sosial & Komunitas' },
      { code: 'ECONOMY', value: 'Ekonomi & UMKM' },
      { code: 'OTHER', value: 'Lain-lain' },
    ];
    this._seedLookup('ASPIRATION_CATEGORY', values);
  }

  /** @private */
  _seedAspirationStatuses() {
    const values = [
      { code: 'SUBMITTED', value: 'Diajukan' },
      { code: 'IN_REVIEW', value: 'Dalam Tinjauan' },
      { code: 'APPROVED', value: 'Disetujui' },
      { code: 'REJECTED', value: 'Ditolak' },
      { code: 'ASSIGNED', value: 'Ditugaskan' },
      { code: 'IMPLEMENTED', value: 'Diimplementasikan' },
      { code: 'ARCHIVED', value: 'Diarsipkan' },
    ];
    this._seedLookup('ASPIRATION_STATUS', values);
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