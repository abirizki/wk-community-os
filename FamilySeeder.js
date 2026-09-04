/**
 * @class FamilySeeder
 * @description Seeds the database with initial lookup data for the Family package.
 */
class FamilySeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('FamilySeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Family package.
   */
  run() {
    this.logger.info('Running seeder for Family package...');
    try {
      this._seedFamilyStatuses();
      this._seedFamilyRelationships();
      this.logger.info('Family package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Family seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedFamilyStatuses() {
    const values = [
      { code: 'ACTIVE', value: 'Aktif' },
      { code: 'INACTIVE', value: 'Tidak Aktif (Pindah)' },
      { code: 'MERGED', value: 'Digabung' },
      { code: 'SPLIT', value: 'Pecah KK' },
    ];
    this._seedLookup('FAMILY_STATUS', values);
  }

  /** @private */
  _seedFamilyRelationships() {
    const values = [
      { code: 'KEPALA_KELUARGA', value: 'Kepala Keluarga' },
      { code: 'ISTRI', value: 'Istri' },
      { code: 'ANAK', value: 'Anak' },
      { code: 'ORANG_TUA', value: 'Orang Tua' },
      { code: 'MERTUA', value: 'Mertua' },
      { code: 'CUCU', value: 'Cucu' },
      { code: 'FAMILI_LAIN', value: 'Famili Lain' },
    ];
    this._seedLookup('FAMILY_RELATIONSHIP', values);
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