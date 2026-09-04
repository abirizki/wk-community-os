/**
 * @class SchoolEntity
 * @description Represents a school or educational institution.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class SchoolEntity {
  /**
   * @param {object} params
   * @param {string} params.id - Unique identifier for the school.
   * @param {string} params.name - Name of the school.
   * @param {string} params.type - Type of school (e.g., 'SD', 'SMP', 'SMA', 'PAUD').
   * @param {object} params.address - Address details of the school.
   * @param {string} [params.contactPerson] - Name of the school's contact person.
   * @param {string} [params.contactPhone] - Contact phone number.
   * @param {string} params.createdAt - ISO 8601 timestamp.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   */
  constructor({
    id,
    name,
    type,
    address,
    contactPerson,
    contactPhone,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.address = address;
    this.contactPerson = contactPerson || null;
    this.contactPhone = contactPhone || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}