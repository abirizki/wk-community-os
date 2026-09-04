/**
 * @class FamilyValidator
 * @description Provides validation logic for Family data.
 */
class FamilyValidator {
  /**
   * @param {FamilyRule} familyRule - The business rule checker for families.
   */
  constructor(familyRule) {
    /** @private */
    this.rule = familyRule;
  }

  /**
   * Validates the payload for creating a new family record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.KKNumber) {
      throw new Error('KK Number (Nomor Kartu Keluarga) is required.');
    }
    if (!payload.headOfFamilyCitizenId) {
      throw new Error('Head of family citizen ID is required.');
    }
    if (!payload.rt || !payload.rw) {
      throw new Error('RT and RW are required.');
    }

    this.rule.checkValidKKNumberFormat(payload.KKNumber);
    this.rule.checkDuplicateKKNumber(payload.KKNumber);
    this.rule.checkHeadOfFamilyExists(payload.headOfFamilyCitizenId);
    this.rule.checkAllMembersExist(payload.members);
    this.rule.checkHeadOfFamilyIsMember(payload.headOfFamilyCitizenId, payload.members);
    this.rule.checkMemberUniqueness(payload.members);
  }

  /**
   * Validates the payload for updating an existing family record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    if (payload.KKNumber) {
      throw new Error('KK Number cannot be changed during an update.');
    }

    this.rule.checkAllMembersExist(payload.members);
    this.rule.checkMemberUniqueness(payload.members);
  }
}