/**
 * @class ChildProfileEntity
 * @description Represents the health profile of a child.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class ChildProfileEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier.
   * @param {string} params.citizenId - The ID of the citizen record for this child.
   * @param {string} params.motherCitizenId - The citizen ID of the mother.
   * @param {string} params.fatherName - The name of the father.
   * @param {string} params.birthDate - ISO 8601 date of birth.
   * @param {number} params.birthWeightKg - Weight at birth in kilograms.
   * @param {number} params.birthHeightCm - Height/length at birth in centimeters.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   */
  constructor({
    id,
    citizenId,
    motherCitizenId,
    fatherName,
    birthDate,
    birthWeightKg,
    birthHeightCm,
    createdAt
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.motherCitizenId = motherCitizenId;
    this.fatherName = fatherName;
    this.birthDate = birthDate;
    this.birthWeightKg = birthWeightKg;
    this.birthHeightCm = birthHeightCm;
    this.createdAt = createdAt;
  }
}