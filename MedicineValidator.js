/**
 * @class MedicineValidator
 * @description Provides validation logic for Medicine master data.
 */
class MedicineValidator {
  /**
   * @param {MedicineRule} medicineRule - The business rule checker for medicines.
   */
  constructor(medicineRule) {
    /** @private */
    this.rule = medicineRule;
  }

  /**
   * Validates the payload for creating a new medicine master record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.code) {
      throw new Error('Medicine code is required.');
    }
    if (!payload.name) {
      throw new Error('Medicine name is required.');
    }
    if (!payload.dosageForm) {
      throw new Error('Dosage form is required.');
    }
    if (!payload.strength) {
      throw new Error('Strength is required.');
    }

    this.rule.checkDuplicate(payload);
    this.rule.checkMasterDataLookups(payload);
  }

  /**
   * Validates the payload for updating an existing medicine master record.
   * @param {string} id - The ID of the medicine being updated.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(id, payload) {
    if (payload.code) {
      throw new Error('Medicine code cannot be changed during an update.');
    }

    this.rule.checkDuplicate({ ...payload, id });
    this.rule.checkMasterDataLookups(payload);
  }
}