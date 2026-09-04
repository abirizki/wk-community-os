/**
 * @class ReferralValidator
 * @description Provides validation logic for Referral data.
 */
class ReferralValidator {
  /**
   * @param {ReferralRule} referralRule - The business rule checker for referral records.
   */
  constructor(referralRule) {
    /** @private */
    this.rule = referralRule;
  }

  /**
   * Validates the payload for creating a new referral.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.citizenId) {
      throw new Error('Citizen ID is required to create a referral.');
    }
    if (!payload.referralDate) {
      throw new Error('Referral date is required.');
    }
    if (!payload.sourceType || !payload.sourceId) {
      throw new Error('Referral source (type and ID) is required.');
    }
    if (!payload.destinationType || !payload.destinationId) {
      throw new Error('Referral destination (type and ID) is required.');
    }
    if (!payload.reason) {
      throw new Error('Referral reason is required.');
    }

    this.rule.checkCitizenAndHealthProfile(payload.citizenId, payload.healthProfileId);
    this.rule.checkSourceContext(payload.sourceType, payload.sourceId, payload.citizenId);
    this.rule.checkDestination(payload.destinationType, payload.destinationId);
    this.rule.checkProvider(payload.referringProviderId);
    this.rule.checkDates(payload);
    this.rule.checkStatus(payload.referralStatus);
    this.rule.checkType(payload.referralType);
    this.rule.checkPriority(payload.priority);
  }

  /**
   * Validates the payload for updating an existing referral.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.citizenId || payload.sourceType || payload.sourceId) {
      throw new Error('Citizen and referral source cannot be changed during an update.');
    }

    this.rule.checkDates(payload);

    if (payload.referralStatus) {
      this.rule.checkStatus(payload.referralStatus);
      // Status transition logic is handled in the service layer via ReferralRule.checkStatusTransition
    }
  }
}