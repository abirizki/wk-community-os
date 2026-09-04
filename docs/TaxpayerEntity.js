/**
 * @class TaxpayerEntity
 * @description Represents a PBB Taxpayer, linked to a Citizen.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class TaxpayerEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the taxpayer record.
   * @param {string} params.citizenId - The ID of the citizen who is the taxpayer.
   * @param {string} params.taxpayerNumber - Unique taxpayer identification number.
   * @param {string} params.status - Status of the taxpayer (e.g., 'ACTIVE', 'INACTIVE').
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    citizenId,
    taxpayerNumber,
    status,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.taxpayerNumber = taxpayerNumber;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}