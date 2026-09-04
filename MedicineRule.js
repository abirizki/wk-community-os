/**
 * @class MedicineRule
 * @description Encapsulates business rule checks for the Medicine package.
 */
class MedicineRule {
  /**
   * @param {MedicineRepository} medicineRepository
   */
  constructor(medicineRepository) {
    /** @private */
    this.repository = medicineRepository;
    /** @private */
    this.logger = WK.logger('MedicineRule');
  }

  /**
   * Checks for a duplicate medicine record.
   * @param {object} payload - The data payload.
   * @throws {Error} If a duplicate record is found.
   */
  checkDuplicate(payload) {
    const { id, code, name, strength, dosageForm } = payload;

    // Check for duplicate code
    const existingByCode = this.repository.findByCode(code);
    if (existingByCode && existingByCode.id !== id) {
      throw new Error(`A medicine with code '${code}' already exists.`);
    }

    // Check for duplicate combination of name, strength, and form
    const query = { name, strength, dosageForm };
    if (id) {
      query.id = { ne: id }; // Exclude self during update
    }
    const existingByDetails = this.repository.search(query, { limit: 1 });
    if (existingByDetails.length > 0) {
      throw new Error(`A medicine with the same name, strength, and dosage form already exists.`);
    }
  }

  /**
   * Checks if lookup-based fields are valid against MasterData.
   * @param {object} payload - The data payload.
   */
  checkMasterDataLookups(payload) {
    const masterDataService = WK.service('MasterData');
    const lookups = [
      { field: 'medicineType', type: 'MEDICINE_TYPE' },
      { field: 'dosageForm', type: 'DOSAGE_FORM' },
      { field: 'unit', type: 'MEDICINE_UNIT' },
      { field: 'category', type: 'MEDICINE_CATEGORY' },
      { field: 'status', type: 'MEDICINE_STATUS' },
    ];

    for (const lookup of lookups) {
      if (payload[lookup.field] && !masterDataService.exists(lookup.type, payload[lookup.field])) {
        throw new Error(`Invalid value for ${lookup.field}: '${payload[lookup.field]}'. It does not exist in master data type '${lookup.type}'.`);
      }
    }
  }

  /**
   * Checks if a medicine is active and can be used in new transactions.
   * @param {string} medicineId - The ID of the medicine.
   * @throws {Error} If the medicine is not active.
   */
  checkIsActive(medicineId) {
    const medicine = this.repository.findById(medicineId);
    if (!medicine) {
      throw new Error(`Medicine with ID ${medicineId} not found.`);
    }
    if (medicine.status !== 'ACTIVE') {
      throw new Error(`Medicine '${medicine.name}' is not active and cannot be used in new transactions.`);
    }
  }
}