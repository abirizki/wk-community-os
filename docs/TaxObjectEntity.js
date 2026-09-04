/**
 * @class TaxObjectEntity
 * @description Represents a Tax Object (Nomor Objek Pajak - NOP).
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class TaxObjectEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the tax object.
   * @param {string} params.nop - Nomor Objek Pajak (Tax Object Number).
   * @param {object} params.address - Address details of the tax object.
   * @param {number} params.landArea - Land area in square meters.
   * @param {number} [params.buildingArea] - Building area in square meters.
   * @param {string} params.ownerCitizenId - The ID of the citizen who owns this tax object.
   * @param {string} params.status - Status of the tax object (e.g., 'ACTIVE', 'INACTIVE').
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    nop,
    address,
    landArea,
    buildingArea,
    ownerCitizenId,
    status,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.nop = nop;
    this.address = address;
    this.landArea = landArea;
    this.buildingArea = buildingArea || 0;
    this.ownerCitizenId = ownerCitizenId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}