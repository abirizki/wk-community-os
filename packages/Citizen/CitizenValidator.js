/**
 * @file CitizenValidator.js
 * @description Payload validator for the Citizen module.
 */

const { CitizenConstants } = require('./CitizenEntity.js');

class CitizenValidator {
  validateRegionCreate(payload) {
    const errors = [];
    if (!payload.name) errors.push('name is required');
    if (!payload.level) errors.push('level is required');
    if (payload.level && !CitizenConstants.REGION_LEVELS.includes(payload.level)) {
      errors.push(`level must be one of: ${CitizenConstants.REGION_LEVELS.join(', ')}`);
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }

  validateFamilyCreate(payload) {
    const errors = [];
    if (!payload.id) {
      errors.push('id (Nomor KK) is required');
    } else if (payload.id.length !== 16 || !/^\d+$/.test(payload.id)) {
      errors.push('id (Nomor KK) must be exactly 16 digits');
    }
    
    if (!payload.regionId) errors.push('regionId is required');
    if (!payload.address) errors.push('address is required');

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }

  validateCitizenRegister(payload) {
    const errors = [];
    if (!payload.id) {
      errors.push('id (NIK) is required');
    } else if (payload.id.length !== 16 || !/^\d+$/.test(payload.id)) {
      errors.push('id (NIK) must be exactly 16 digits');
    }

    if (!payload.familyId) errors.push('familyId is required');
    if (!payload.fullName) errors.push('fullName is required');
    if (!payload.birthDate) errors.push('birthDate is required');
    if (!payload.gender) errors.push('gender is required');
    if (!payload.religion) errors.push('religion is required');

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }
}

module.exports = { CitizenValidator };

