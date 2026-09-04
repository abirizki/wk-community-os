/**
 * @class PBBRule
 * @description Encapsulates business rule checks for the PBB (Pajak Bumi dan Bangunan) package.
 */
class PBBRule {
  /**
   * @param {PBBRepository} pbbRepository
   */
  constructor(pbbRepository) {
    /** @private */
    this.repository = pbbRepository;
    /** @private */
    this.logger = WK.logger('PBBRule');

    /** @private */
    this.allowedStatusTransitions = {
      'BELUM LUNAS': ['MENUNGGAK', 'LUNAS'],
      'MENUNGGAK': ['BELUM LUNAS', 'LUNAS'],
      'LUNAS': [],
    };
  }

  /**
   * Validates the NOP (Nomor Objek Pajak) format.
   * @param {string} nop - The NOP to validate.
   * @throws {Error} If the NOP format is invalid.
   */
  checkValidNOP(nop) {
    // NOP typically follows format: RT.RW/NO.UL/MK/LT or similar.
    // This is a basic validation - a rigorous NOP format check may require comprehensive rules.
    if (!nop) {
      throw new Error('NOP cannot be empty.');
    }
    if (typeof nop !== 'string') {
      throw new Error('NOP must be a string.');
    }
    // Remove whitespace and check if it has content
    if (nop.replace(/\s/g, '').length === 0) {
      throw new Error('NOP must contain valid characters.');
    }
    
    // Optional: Check for basic alphanumeric format
    // if (!/^[A-Z0-9\/\.\-]+$/.test(nop.replace(/\s/g, ''))) {
    //   throw new Error('NOP must contain only alphanumeric characters, slashes, and dots.');
    // }
  }

  /**
   * Validates the tax year.
   * @param {number|string} taxYear - The tax year to validate.
   * @throws {Error} If the tax year is invalid.
   */
  checkValidTaxYear(taxYear) {
    const year = parseInt(taxYear);
    if (isNaN(year)) {
      throw new Error('Tax year must be a valid number.');
    }
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      throw new Error(`Tax year must be between 1900 and ${currentYear + 1}.`);
    }
  }

  /**
   * Validates the payment status.
   * @param {string} paymentStatus - The payment status to validate.
   * @throws {Error} If the payment status is invalid.
   */
  checkValidPaymentStatus(paymentStatus) {
    const validStatuses = PBBConstants.PAYMENT_STATUSES;
    if (!validStatuses.includes(paymentStatus)) {
      throw new Error(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  /**
   * Validates the object category.
   * @param {string} objectCategory - The object category to validate.
   * @throws {Error} If the object category is invalid.
   */
  checkValidObjectCategory(objectCategory) {
    const validCategories = PBBConstants.OBJECT_CATEGORIES;
    if (!validCategories.includes(objectCategory)) {
      throw new Error(`Invalid object category. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  /**
   * Validates land or building area.
   * @param {number} area - The area to validate.
   * @param {string} type - 'land' or 'building'.
   * @throws {Error} If the area is invalid.
   */
  checkValidArea(area, type) {
    if (typeof area !== 'number' || isNaN(area)) {
      throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} area must be a number.`);
    }
    if (area < 0) {
      throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} area cannot be negative.`);
    }
  }

  /**
   * Checks if there's a duplicate SPPT in the same year for the same taxpayer.
   * @param {string} nop - The NOP.
   * @param {string} taxYear - The tax year.
   * @throws {Error} If a duplicate SPPT is detected.
   */
  checkDuplicateSppt(nop, taxYear) {
    const existing = this.repository.search({ nop, taxYear });
    if (existing.length > 0) {
      this.logger.warn(`Attempted to create duplicate SPPT for NOP ${nop}, year ${taxYear}`);
      throw new Error(`An SPPT already exists for NOP ${nop} in year ${taxYear}.`);
    }
  }

  /**
   * Validates that payment amount is sufficient.
   * @param {PBB} sppt - The SPPT record.
   * @param {number} amount - The payment amount.
   * @throws {Error} If the amount is invalid.
   */
  checkValidPaymentAmount(sppt, amount) {
    if (amount <= 0) {
      throw new Error('Payment amount must be positive.');
    }
    if (amount > sppt.taxAmount) {
      throw new Error(`Payment amount ${amount} cannot exceed tax amount ${sppt.taxAmount}.`);
    }
  }

  /**
   * Validates payment data with the SPPT record.
   * @param {PBB} sppt - The SPPT record.
   * @param {object} paymentData - The payment data.
   * @throws {Error} If validation fails.
   */
  validatePayment(sppt, paymentData) {
    this.checkValidPaymentAmount(sppt, paymentData.amount);

    // Check if already paid
    if (sppt.paymentStatus === 'LUNAS') {
      throw new Error('This SPPT has already been paid. Do not confirm payment again.');
    }

    // Check if payment is for correct due amount
    if (sppt.arrearsAmount > 0) {
      if (paymentData.amount < sppt.arrearsAmount) {
        throw new Error(`Payment amount ${paymentData.amount} is insufficient for arrears (outstanding: ${sppt.arrearsAmount}).`);
      }
    }
  }
}

module.exports = PBBRule;
