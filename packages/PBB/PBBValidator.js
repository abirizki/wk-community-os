/**
 * @file PBBValidator.js
 * @description Payload validator for PBB tax management module.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

const { PBBConstants } = require('./PBBEntity.js');
const { PBBRule } = require('./PBBRule.js');

class PBBValidator {
  constructor() {
    this.rule = new PBBRule();
  }

  /**
   * Validate PBBObject registration payload.
   * @param {Object} payload
   */
  validateObjectRegistration(payload = {}) {
    const errors = [];

    if (!payload.nop) {
      errors.push('nop is required');
    } else if (!this.rule.validateNopFormat(payload.nop)) {
      errors.push('nop must be a valid 18-digit numeric string');
    }

    if (!payload.taxpayerCitizenId) errors.push('taxpayerCitizenId is required (NIK Wajib Pajak)');
    if (!payload.objectAddress || typeof payload.objectAddress !== 'string' || payload.objectAddress.trim().length === 0) {
      errors.push('objectAddress is required');
    }

    if (payload.landAreaSqm === undefined || payload.landAreaSqm === null || Number(payload.landAreaSqm) < 0) {
      errors.push('landAreaSqm must be a non-negative number');
    }

    if (payload.buildingAreaSqm === undefined || payload.buildingAreaSqm === null || Number(payload.buildingAreaSqm) < 0) {
      errors.push('buildingAreaSqm must be a non-negative number');
    }

    if (payload.njopTotal === undefined || payload.njopTotal === null || Number(payload.njopTotal) < 0) {
      errors.push('njopTotal must be a non-negative number');
    }

    if (payload.category && !PBBConstants.PBB_OBJECT_CATEGORIES.includes(payload.category)) {
      errors.push(`category must be one of: [${PBBConstants.PBB_OBJECT_CATEGORIES.join(', ')}]`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }

  /**
   * Validate PBBPayment confirmation payload.
   * @param {Object} payload
   */
  validatePaymentConfirmation(payload = {}) {
    const errors = [];

    if (!payload.billId) errors.push('billId is required');
    if (!payload.nop) errors.push('nop is required');

    if (payload.paidAmount === undefined || payload.paidAmount === null || Number(payload.paidAmount) <= 0) {
      errors.push('paidAmount must be a positive number');
    }

    if (!payload.paymentProofUrl || typeof payload.paymentProofUrl !== 'string' || payload.paymentProofUrl.trim().length === 0) {
      errors.push('paymentProofUrl is required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join('; ')}`);
    }
  }
}

module.exports = { PBBValidator };

