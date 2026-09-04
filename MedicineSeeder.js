/**
 * @class MedicineSeeder
 * @description Seeds the database with initial lookup data for the Medicine package.
 */
class MedicineSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('MedicineSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Medicine package.
   */
  run() {
    this.logger.info('Running seeder for Medicine package...');
    try {
      this._seedMedicineTypes();
      this._seedDosageForms();
      this._seedMedicineUnits();
      this._seedMedicineCategories();
      this._seedMedicineStatuses();
      this.logger.info('Medicine package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Medicine seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedMedicineTypes() {
    const values = [
      { code: 'GENERIK', value: 'Generik' },
      { code: 'PATEN', value: 'Paten' },
      { code: 'HERBAL', value: 'Herbal' },
    ];
    this._seedLookup('MEDICINE_TYPE', values);
  }

  /** @private */
  _seedDosageForms() {
    const values = [
      { code: 'TABLET', value: 'Tablet' },
      { code: 'CAPSULE', value: 'Capsule' },
      { code: 'SYRUP', value: 'Syrup' },
      { code: 'DROPS', value: 'Drops' },
      { code: 'CREAM', value: 'Cream' },
      { code: 'OINTMENT', value: 'Ointment' },
      { code: 'INJECTION', value: 'Injection' },
      { code: 'SUPPOSITORY', value: 'Suppository' },
    ];
    this._seedLookup('DOSAGE_FORM', values);
  }

  /** @private */
  _seedMedicineUnits() {
    const values = [
      { code: 'TABLET', value: 'Tablet' },
      { code: 'CAPSULE', value: 'Capsule' },
      { code: 'BOTTLE', value: 'Bottle' },
      { code: 'TUBE', value: 'Tube' },
      { code: 'AMPOULE', value: 'Ampoule' },
      { code: 'VIAL', value: 'Vial' },
    ];
    this._seedLookup('MEDICINE_UNIT', values);
  }

  /** @private */
  _seedMedicineCategories() {
    const values = [
      { code: 'ANALGESIC', value: 'Analgesic' },
      { code: 'ANTIBIOTIC', value: 'Antibiotic' },
      { code: 'ANTIHISTAMINE', value: 'Antihistamine' },
      { code: 'VITAMIN', value: 'Vitamin' },
      { code: 'VACCINE', value: 'Vaccine' },
    ];
    this._seedLookup('MEDICINE_CATEGORY', values);
  }

  /** @private */
  _seedMedicineStatuses() {
    const values = [
      { code: 'ACTIVE', value: 'Active' },
      { code: 'INACTIVE', value: 'Inactive' },
      { code: 'ARCHIVED', value: 'Archived' },
    ];
    this._seedLookup('MEDICINE_STATUS', values);
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