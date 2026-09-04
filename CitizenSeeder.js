/**
 * @class CitizenSeeder
 * @description Seeds the database with initial lookup data for the Citizen package.
 */
class CitizenSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('CitizenSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Citizen package.
   */
  run() {
    this.logger.info('Running seeder for Citizen package...');
    try {
      this._seedGender();
      this._seedReligion();
      this._seedEducationLevels();
      this._seedOccupations();
      this._seedMaritalStatuses();
      this._seedCitizenStatuses();
      this.logger.info('Citizen package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Citizen seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedGender() {
    const values = [
      { code: 'MALE', value: 'Laki-laki' },
      { code: 'FEMALE', value: 'Perempuan' },
    ];
    this._seedLookup('GENDER', values);
  }

  /** @private */
  _seedReligion() {
    const values = [
      { code: 'ISLAM', value: 'Islam' },
      { code: 'KRISTEN', value: 'Kristen' },
      { code: 'KATOLIK', value: 'Katolik' },
      { code: 'HINDU', value: 'Hindu' },
      { code: 'BUDDHA', value: 'Buddha' },
      { code: 'KONGHUCU', value: 'Konghucu' },
    ];
    this._seedLookup('RELIGION', values);
  }

  /** @private */
  _seedEducationLevels() {
    const values = [
      { code: 'TIDAK_SEKOLAH', value: 'Tidak Sekolah' },
      { code: 'SD', value: 'SD / Sederajat' },
      { code: 'SMP', value: 'SMP / Sederajat' },
      { code: 'SMA', value: 'SMA / Sederajat' },
      { code: 'DIPLOMA', value: 'Diploma' },
      { code: 'SARJANA', value: 'Sarjana (S1)' },
      { code: 'MAGISTER', value: 'Magister (S2)' },
      { code: 'DOKTOR', value: 'Doktor (S3)' },
    ];
    this._seedLookup('EDUCATION_LEVEL', values);
  }

  /** @private */
  _seedOccupations() {
    const values = [
      { code: 'PELAJAR', value: 'Pelajar/Mahasiswa' },
      { code: 'PNS', value: 'Pegawai Negeri Sipil' },
      { code: 'TNI_POLRI', value: 'TNI/POLRI' },
      { code: 'SWASTA', value: 'Karyawan Swasta' },
      { code: 'WIRASWASTA', value: 'Wiraswasta' },
      { code: 'PETANI', value: 'Petani' },
      { code: 'IRT', value: 'Ibu Rumah Tangga' },
      { code: 'TIDAK_BEKERJA', value: 'Tidak Bekerja' },
    ];
    this._seedLookup('OCCUPATION', values);
  }

  /** @private */
  _seedMaritalStatuses() {
    const values = [
      { code: 'BELUM_KAWIN', value: 'Belum Kawin' },
      { code: 'KAWIN', value: 'Kawin' },
      { code: 'CERAI_HIDUP', value: 'Cerai Hidup' },
      { code: 'CERAI_MATI', value: 'Cerai Mati' },
    ];
    this._seedLookup('MARITAL_STATUS', values);
  }

  /** @private */
  _seedCitizenStatuses() {
    const values = [
      { code: 'ACTIVE', value: 'Aktif' },
      { code: 'INACTIVE', value: 'Tidak Aktif (Pindah)' },
      { code: 'DECEASED', value: 'Meninggal Dunia' },
    ];
    this._seedLookup('CITIZEN_STATUS', values);
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