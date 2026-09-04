/**
 * @file CitizenRule.js
 * @description Business rules and data integrity logic for the Citizen module.
 */

const { CitizenConstants } = require('./CitizenEntity.js');

class CitizenRule {
  checkValidGender(gender) {
    if (!CitizenConstants.GENDERS.includes(gender)) {
      throw new Error(`Business Rule Violation: Invalid gender '${gender}'. Allowed: ${CitizenConstants.GENDERS.join(', ')}`);
    }
  }

  checkValidMaritalStatus(status) {
    if (!CitizenConstants.MARITAL_STATUSES.includes(status)) {
      throw new Error(`Business Rule Violation: Invalid marital status '${status}'. Allowed: ${CitizenConstants.MARITAL_STATUSES.join(', ')}`);
    }
  }

  checkValidFamilyRelation(relation) {
    if (!CitizenConstants.FAMILY_RELATIONS.includes(relation)) {
      throw new Error(`Business Rule Violation: Invalid family relation '${relation}'. Allowed: ${CitizenConstants.FAMILY_RELATIONS.join(', ')}`);
    }
  }

  checkValidResidencyStatus(status) {
    if (!CitizenConstants.RESIDENCY_STATUSES.includes(status)) {
      throw new Error(`Business Rule Violation: Invalid residency status '${status}'. Allowed: ${CitizenConstants.RESIDENCY_STATUSES.join(', ')}`);
    }
  }

  checkUniqueNik(nik, existingRecord) {
    if (existingRecord) {
      throw new Error(`Business Rule Violation: NIK ${nik} is already registered.`);
    }
  }

  checkUniqueKk(kk, existingRecord) {
    if (existingRecord) {
      throw new Error(`Business Rule Violation: Nomor KK ${kk} is already registered.`);
    }
  }

  checkResidencyTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) return;

    if (currentStatus === 'DECEASED') {
      throw new Error("Business Rule Violation: Cannot change residency status from DECEASED. This is a terminal state.");
    }
    
    // Once moved out, it's generally a terminal status within the system, but might re-enter as ACTIVE
    // We enforce that DECEASED is strictly terminal.
  }
}

module.exports = { CitizenRule };

