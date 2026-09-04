/**
 * @class PBBValidator
 * @description Provides validation logic for the PBB module's data.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBValidator {
  constructor() {}

  /**
   * Validates data for a new Tax Object (NOP) registration.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateTaxObjectRegistration(data) {
    if (!data) throw new Error('Tax object data is required.');
    if (!data.nop) throw new Error('NOP (Nomor Objek Pajak) is required.');
    if (!data.address || !data.address.street) throw new Error('Tax object address is required.');
    if (!data.landArea || data.landArea <= 0) throw new Error('Land area must be a positive number.');
    if (!data.ownerCitizenId) throw new Error('Owner Citizen ID is required.');
  }

  /**
   * Validates data for a new taxpayer registration.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateTaxpayerRegistration(data) {
    if (!data) throw new Error('Taxpayer data is required.');
    if (!data.citizenId) throw new Error('Citizen ID is required for taxpayer registration.');
    if (!data.taxpayerNumber) throw new Error('Taxpayer Number is required.');
  }

  /**
   * Validates data for SPPT issuance.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateSPPTIssuance(data) {
    if (!data) throw new Error('SPPT data is required.');
    if (!data.taxpayerId) throw new Error('Taxpayer ID is required for SPPT issuance.');
    if (!data.taxObjectId) throw new Error('Tax Object ID is required for SPPT issuance.');
    if (!data.taxYear || data.taxYear <= 0) throw new Error('Tax year must be a positive number.');
    if (!data.taxAmount || data.taxAmount <= 0) throw new Error('Tax amount must be a positive number.');
    if (!data.dueDate) throw new Error('Due date is required for SPPT.');
    if (new Date(data.dueDate) < new Date()) throw new Error('Due date cannot be in the past.');
  }

  /**
   * Validates data for a payment record.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validatePaymentRecord(data) {
    if (!data) throw new Error('Payment data is required.');
    if (!data.paymentDate) throw new Error('Payment date is required.');
    if (!data.paymentAmount || data.paymentAmount <= 0) throw new Error('Payment amount must be a positive number.');
    if (!data.paymentMethod) throw new Error('Payment method is required.');
  }

  /**
   * Validates data for updating an entity.
   * @param {object} data - The data to validate.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(data) {
    if (!data) throw new Error('Update data is required.');
    if (Object.keys(data).length === 0) throw new Error('No update data provided.');
  }
}