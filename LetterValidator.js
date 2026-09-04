/**
 * @class LetterValidator
 * @description Provides validation logic for Letter data.
 */
class LetterValidator {
  /**
   * @param {LetterRule} letterRule - The business rule checker for letters.
   */
  constructor(letterRule) {
    /** @private */
    this.rule = letterRule;
  }

  /**
   * Validates the payload for creating a new letter.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.administrativeServiceId) {
      throw new Error('Administrative Service ID is required to create a letter.');
    }
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a letter.');
    }
    if (!payload.letterType) {
      throw new Error('Letter type is required.');
    }
    if (!payload.templateId) {
      throw new Error('Template ID is required to create a letter.');
    }

    this.rule.checkAdministrativeServiceRequestExists(payload.administrativeServiceId);
    this.rule.checkRequestIsApproved(payload.administrativeServiceId);
    this.rule.checkDuplicateLetterForRequest(payload.administrativeServiceId);
    this.rule.checkTemplateExists(payload.templateId);
  }

  /**
   * Validates the payload for updating an existing letter.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    const immutableFields = ['administrativeServiceId', 'citizenId', 'familyId', 'letterType', 'templateId'];
    for (const field of immutableFields) {
      if (payload[field]) {
        throw new Error(`'${field}' cannot be changed during an update.`);
      }
    }
  }
}