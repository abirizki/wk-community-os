/**
 * @class AspirationValidator
 * @description Provides validation logic for Aspiration data.
 */
class AspirationValidator {
  /**
   * @param {AspirationRule} aspirationRule - The business rule checker for aspirations.
   */
  constructor(aspirationRule) {
    /** @private */
    this.rule = aspirationRule;
  }

  /**
   * Validates the payload for creating a new aspiration.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to submit an aspiration.');
    }
    if (!payload.subject) {
      throw new Error('Aspiration subject is required.');
    }
    if (!payload.description) {
      throw new Error('Aspiration description is required.');
    }
    if (!payload.category) {
      throw new Error('Aspiration category is required.');
    }

    this.rule.checkCitizenExists(payload.citizenId);
    if (payload.familyId) {
      this.rule.checkFamilyExists(payload.familyId);
      this.rule.checkCitizenFamilyRelationship(payload.citizenId, payload.familyId);
    }
    this.rule.checkValidCategory(payload.category);
  }

  /**
   * Validates the payload for updating an existing aspiration.
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
  }
}