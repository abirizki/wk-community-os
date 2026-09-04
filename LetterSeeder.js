/**
 * @class LetterSeeder
 * @description Seeds the database with initial lookup data for the Letter package.
 */
class LetterSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('LetterSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Letter package.
   */
  run() {
    this.logger.info('Running seeder for Letter package...');
    try {
      this._seedLetterStatuses();
      this._seedLetterTypes();
      this.logger.info('Letter package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Letter seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedLetterStatuses() {
    const values = [
      { code: 'DRAFT', value: 'Draf' },
      { code: 'PENDING_SIGNATURE', value: 'Menunggu Tanda Tangan' },
      { code: 'ISSUED', value: 'Diterbitkan' },
      { code: 'EXPIRED', value: 'Kedaluwarsa' },
      { code: 'REVOKED', value: 'Dibatalkan' },
      { code: 'REJECTED', value: 'Ditolak' },
      { code: 'CANCELLED', value: 'Dibatalkan Pengguna' },
    ];
    this._seedLookup('LETTER_STATUS', values);
  }

  /** @private */
  _seedLetterTypes() {
    // These should align with AdministrativeService request types that produce letters.
    const values = [
      { code: 'SURAT_PENGANTAR', value: 'Surat Pengantar' },
      { code: 'SKTM', value: 'Surat Keterangan Tidak Mampu' },
    ];
    this._seedLookup('LETTER_TYPE', values);
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