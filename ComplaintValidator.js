/**
 * @class ComplaintValidator
 * @description Provides validation logic for Complaint data.
 */
class ComplaintValidator {
  /**
   * @param {ComplaintRule} complaintRule - The business rule checker for complaints.
   */
  constructor(complaintRule) {
    /** @private */
    this.rule = complaintRule;
  }

  /**
   * Validates the payload for creating a new complaint.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to file a complaint.');
    }
    if (!payload.subject) {
      throw new Error('Complaint subject is required.');
    }
    if (!payload.description) {
      throw new Error('Complaint description is required.');
    }
    if (!payload.category) {
      throw new Error('Complaint category is required.');
    }

    this.rule.checkCitizenExists(payload.citizenId);
    if (payload.familyId) {
      this.rule.checkFamilyExists(payload.familyId);
      this.rule.checkCitizenFamilyRelationship(payload.citizenId, payload.familyId);
    }
    this.rule.checkValidCategory(payload.category);
    this.rule.checkValidPriority(payload.priority);
  }

  /**
   * Validates the payload for updating an existing complaint.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    const immutableFields = ['citizenId', 'familyId', 'submissionDate'];
    for (const field of immutableFields) {
      if (payload[field]) {
        throw new Error(`'${field}' cannot be changed during an update.`);
      }
    }
    this.rule.checkValidCategory(payload.category);
    this.rule.checkValidPriority(payload.priority);
  }
}