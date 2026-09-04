/**
 * @class AdministrativeServiceSeeder
 * @description Seeds the database with initial lookup data for the AdministrativeService package.
 */
class AdministrativeServiceSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('AdministrativeServiceSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the AdministrativeService package.
   */
  run() {
    this.logger.info('Running seeder for AdministrativeService package...');
    try {
      this._seedRequestTypes();
      this._seedRequestStatuses();
      this._seedPriorities();
      this._seedVerificationStatuses();
      this._seedProcessingStatuses();
      this.logger.info('AdministrativeService package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`AdministrativeService seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedRequestTypes() {
    const values = [
      { code: 'SURAT_PENGANTAR', value: 'Surat Pengantar' },
      { code: 'SKTM', value: 'Surat Keterangan Tidak Mampu' },
    ];
    this._seedLookup('ADMIN_SERVICE_REQUEST_TYPE', values);
  }

  /** @private */
  _seedRequestStatuses() {
    const values = [
      { code: 'DRAFT', value: 'Draf' },
      { code: 'SUBMITTED', value: 'Diajukan' },
      { code: 'RT_VERIFIED', value: 'Terverifikasi RT' },
      { code: 'RW_VERIFIED', value: 'Terverifikasi RW' },
      { code: 'KELURAHAN_PROCESSED', value: 'Diproses Kelurahan' },
      { code: 'COMPLETED', value: 'Selesai' },
      { code: 'REJECTED', value: 'Ditolak' },
      { code: 'CANCELLED', value: 'Dibatalkan' },
    ];
    this._seedLookup('ADMIN_SERVICE_STATUS', values);
  }

  /** @private */
  _seedPriorities() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'URGENT', value: 'Penting' },
    ];
    this._seedLookup('ADMIN_SERVICE_PRIORITY', values);
  }

  /** @private */
  _seedVerificationStatuses() {
    const values = [
      { code: 'PENDING', value: 'Menunggu Verifikasi' },
      { code: 'VERIFIED', value: 'Terverifikasi' },
      { code: 'REJECTED', value: 'Ditolak' },
    ];
    this._seedLookup('VERIFICATION_STATUS', values);
  }

  /** @private */
  _seedProcessingStatuses() {
    const values = [
      { code: 'PENDING', value: 'Menunggu Proses' },
      { code: 'PROCESSED', value: 'Telah Diproses' },
      { code: 'REJECTED', value: 'Ditolak' },
    ];
    this._seedLookup('PROCESSING_STATUS', values);
  }

  /** @private */
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