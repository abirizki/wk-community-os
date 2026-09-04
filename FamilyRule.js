/**
 * @class FamilyRule
 * @description Encapsulates business rule checks for the Family package.
 */
class FamilyRule {
  /**
   * @param {FamilyRepository} familyRepository
   * @param {CitizenRepository} citizenRepository
   */
  constructor(familyRepository, citizenRepository) {
    /** @private */
    this.familyRepository = familyRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.logger = WK.logger('FamilyRule');
  }

  /**
   * Checks for a duplicate KK Number.
   * @param {string} KKNumber - The KK Number to check.
   * @throws {Error} If a family with the same KK Number already exists.
   */
  checkDuplicateKKNumber(KKNumber) {
    const existingFamily = this.familyRepository.findByKKNumber(KKNumber);
    if (existingFamily) {
      this.logger.warn(`Attempted to create family with duplicate KK Number: ${KKNumber}`);
      throw new Error(`Family with KK Number ${KKNumber} already exists.`);
    }
  }

  /**
   * Checks if the KK Number format is valid.
   * @param {string} KKNumber - The KK Number to validate.
   * @throws {Error} If the KK Number format is invalid.
   */
  checkValidKKNumberFormat(KKNumber) {
    // KK Number in Indonesia is 16 digits.
    if (!/^\d{16}$/.test(KKNumber)) {
      throw new Error('KK Number must be a 16-digit number.');
    }
  }

  /**
   * Checks if the citizen designated as head of family exists.
   * @param {string} citizenId - The citizen ID of the head of family.
   * @throws {Error} If the citizen does not exist.
   */
  checkHeadOfFamilyExists(citizenId) {
    if (!this.citizenRepository.exists(citizenId)) {
      throw new Error(`Designated head of family with citizen ID ${citizenId} does not exist.`);
    }
  }

  /**
   * Checks if all listed members exist as citizens.
   * @param {Array<{citizenId: string}>} members - The list of members.
   * @throws {Error} If any member does not exist.
   */
  checkAllMembersExist(members = []) {
    for (const member of members) {
      if (!this.citizenRepository.exists(member.citizenId)) {
        throw new Error(`Family member with citizen ID ${member.citizenId} does not exist.`);
      }
    }
  }

  /**
   * Ensures the designated head of family is also included in the members list
   * with the correct relationship.
   * @param {string} headOfFamilyCitizenId - The citizen ID of the head of family.
   * @param {Array<{citizenId: string, relationship: string}>} members - The list of members.
   * @throws {Error} If the head of family is not in the members list correctly.
   */
  checkHeadOfFamilyIsMember(headOfFamilyCitizenId, members = []) {
    const headMember = members.find(m => m.citizenId === headOfFamilyCitizenId);
    if (!headMember) {
      throw new Error('The designated head of family must be included in the members list.');
    }
    if (headMember.relationship !== 'KEPALA_KELUARGA') {
      throw new Error('The designated head of family must have the relationship "KEPALA_KELUARGA".');
    }
  }

  /**
   * Ensures there are no duplicate citizens in the members list.
   * @param {Array<{citizenId: string}>} members - The list of members.
   * @throws {Error} If a duplicate citizen is found.
   */
  checkMemberUniqueness(members = []) {
    const citizenIds = members.map(m => m.citizenId);
    const uniqueCitizenIds = new Set(citizenIds);
    if (uniqueCitizenIds.size !== citizenIds.length) {
      throw new Error('Duplicate citizens found in the family members list.');
    }
  }
}