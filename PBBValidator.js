/**
 * @class PBBValidator
 * @description Provides validation logic for PBB (Pajak Bumi dan Bangunan) data.
 */
class PBBValidator {
  /**
   * @param {PBBRule} pbbRule - The business rule checker for PBB.
   */
  constructor(pbbRule) {
    /** @private */
    this.rule = pbbRule;
  }

  /**
   * Validates the payload for creating a new PBB record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.nop) {
      throw new Error('NOP (Nomor Objek Pajak) is required.');
    }
    if (!payload.taxpayerName) {
      throw new Error('Taxpayer name is required.');
    }
    if (!payload.rt) {
      throw new Error('RT (Rukun Tetangga) is required.');
    }
    if (!payload.rw) {
      throw new Error('RW (Rukun Warga) is required.');
    }
    if (!payload.taxYear) {
      throw new Error('Tax year is required.');
    }
    if (!payload.landArea && payload.landArea !== 0) {
      throw new Error('Land area (m²) is required or must be 0 (for free land).');
    }
    if (!payload.buildingArea && payload.buildingArea !== 0) {
      throw new Error('Building area (m²) is required or must be 0 (for free building).');
    }
    if (!payload.njop) {
      throw new Error('NJP (Nilai Jasa Objek) is required.');
    }

    this.rule.checkValidNOP(payload.nop);
    this.rule.checkValidTaxYear(payload.taxYear);
    this.rule.checkValidPaymentStatus(payload.paymentStatus);
    this.rule.checkValidObjectCategory(payload.objectCategory);
  }

  /**
   * Validates the payload for updating a PBB record.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForUpdate(payload) {
    // NOP (Nomor Objek Pajak) should not be changed once established
    if (payload.nop) {
      throw new Error('NOP cannot be changed during an update.');
    }
  
    // Tax year should not be changed once established
    if (payload.taxYear) {
      throw new Error('Tax year cannot be changed during an update.');
    }

    if (payload.landArea !== undefined && payload.landArea !== null) {
      this.rule.checkValidArea(payload.landArea, 'land');
    }
    if (payload.buildingArea !== undefined && payload.buildingArea !== null) {
      this.rule.checkValidArea(payload.buildingArea, 'building');
    }
    if (payload.paymentStatus !== undefined && payload.paymentStatus !== null) {
      this.rule.checkValidPaymentStatus(payload.paymentStatus);
    }
    if (payload.objectCategory !== undefined && payload.objectCategory !== null) {
      this.rule.checkValidObjectCategory(payload.objectCategory);
    }
  }

  /**
   * Validates the payment confirmation data.
   * @param {string} spptId - The SPPT ID.
   * @param {object} paymentData - The payment details.
   * @throws {Error} If validation fails.
   */
  validateForPaymentConfirmation(spptId, paymentData) {
    if (!spptId) {
      throw new Error('SPPT ID is required for payment confirmation.');
    }
    if (!paymentData || typeof paymentData !== 'object') {
      throw new Error('Payment data is required.');
    }

    // Payment amount must be positive
    if (paymentData.amount < 0) {
      throw new Error('Payment amount cannot be negative.');
    }

    // Payment proof must be provided if installment payment
    if (paymentData.isInstallment && !paymentData.paymentProof) {
      throw new Error('Payment proof is required for installment payment.');
    }
  }

  /**
   * Validates the payment status transition.
   * @param {string} currentStatus - The current status.
   * @param {string} newStatus - The new status.
   * @throws {Error} If the transition is invalid.
   */
  validatePaymentStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = {
      'BELUM LUNAS': ['MENUNGGAK', 'LUNAS'],
      'MENUNGGAK': ['BELUM LUNAS', 'LUNAS'],
      'LUNAS': [],
    };

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid payment status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

module.exports = PBBValidator;
