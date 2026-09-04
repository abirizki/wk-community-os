/**
 * @class SPPTEntity
 * @description Represents a Surat Pemberitahuan Pajak Terutang (SPPT).
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class SPPTEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the SPPT.
   * @param {string} params.taxpayerId - The ID of the taxpayer.
   * @param {string} params.taxObjectId - The ID of the tax object (NOP).
   * @param {string} params.spptNumber - Unique SPPT number.
   * @param {number} params.taxYear - The year for which the tax is due.
   * @param {number} params.taxAmount - The total tax amount due.
   * @param {string} params.dueDate - ISO 8601 date when the tax is due.
   * @param {string} params.status - Status of the SPPT (e.g., 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED').
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    taxpayerId,
    taxObjectId,
    spptNumber,
    taxYear,
    taxAmount,
    dueDate,
    status,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.taxpayerId = taxpayerId;
    this.taxObjectId = taxObjectId;
    this.spptNumber = spptNumber;
    this.taxYear = taxYear;
    this.taxAmount = taxAmount;
    this.dueDate = dueDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}