/**
 * @class PBBService
 * @description The main service for managing Pajak Bumi dan Bangunan (PBB) / SPPT records
 * and payment operations.
 */
class PBBService {
  /**
   * @param {PBBRepository} pbbRepository
   * @param {PBBValidator} pbbValidator
   * @param {PBBPermission} pbbPermission
   * @param {PBBRule} pbbRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(pbbRepository, pbbValidator, pbbPermission, pbbRule, eventBus, analyticsService) {
    /** @private */
    this.repository = pbbRepository;
    /** @private */
    this.validator = pbbValidator;
    /** @private */
    this.permission = pbbPermission;
    /** @private */
    this.rule = pbbRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('PBBService');
  }

  /**
   * Creates a new PBB / SPPT record.
   * @param {object} payload - The data for the new PBB record.
   * @returns {PBB} The newly created PBB record.
   */
  createSPPT(payload) {
    this.permission.check('pbb.sppt.create');
    this.logger.info(`Attempting to create SPPT for NOP: ${payload.nop}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const pbbEntity = new PBB(entityData);
    const createdRecord = this.repository.create(pbbEntity);

    this.eventBus.publish('SpptCreated', {
      source: 'PBBService',
      payload: createdRecord,
    });

    this.analyticsService.track('sppt_created', {
      spptId: createdRecord.spptId,
      nop: createdRecord.nop,
      taxYear: createdRecord.taxYear,
      category: createdRecord.objectCategory,
    });

    this.logger.info(`Successfully created SPPT ${createdRecord.spptId} for NOP ${createdRecord.nop}`);
    return createdRecord;
  }

  /**
   * Retrieves a single PBB record by its ID.
   * @param {string} id - The ID of the PBB record.
   * @returns {PBB}
   */
  getPBB(id) {
    this.permission.check('pbb.sppt.read');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`PBB record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves a single SPPT record by its SPPT ID.
   * @param {string} spptId - The SPPT ID.
   * @returns {PBB}
   */
  getSPPT(spptId) {
    this.permission.check('pbb.sppt.read');
    const record = this.repository.findById(spptId);
    if (!record) {
      throw new Error(`SPPT with ID ${spptId} not found.`);
    }
    return record;
  }

  /**
   * Retrieves a PBB record by NOP (Nomor Objek Pajak).
   * @param {string} nop - The NOP.
   * @returns {PBB}
   */
  getPBBByNOP(nop) {
    this.permission.check('pbb.sppt.read.unauthenticated');
    const records = this.repository.search({ nop });
    if (records.length === 0) {
      throw new Error(`PBB record with NOP ${nop} not found.`);
    }
    return records[0];
  }

  /**
   * Searches for PBB records based on query parameters.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {PBB[]}
   */
  searchPBB(query, options = {}) {
    this.permission.check('pbb.sppt.search');
    return this.repository.search(query, options);
  }

  /**
   * Confirms payment for a PBB record.
   * @param {string} spptId - The SPPT ID.
   * @param {object} paymentData - The payment details.
   * @returns {PBB} The updated PBB record.
   */
  confirmPayment(spptId, paymentData) {
    this.permission.check('pbb.payment.confirm');
    this.logger.info(`Confirming payment for SPPT: ${spptId}`);

    const sppt = this.getSPPT(spptId);

    this.rule.validatePayment(sppt, paymentData);

    const currentUser = WK.user();
    const now = new Date().toISOString();
    const updatedRecord = this.repository.update(spptId, {
      ...paymentData,
      paymentStatus: 'LUNAS',
      paymentDate: now,
      updatedBy: currentUser.id,
    });

    this.eventBus.publish('SpptPaymentConfirmed', {
      source: 'PBBService',
      payload: updatedRecord,
    });

    this.analyticsService.track('sppt_payment_confirmed', {
      spptId: spptId,
      nop: sppt.nop,
      amount: sppt.taxAmount,
    });

    this.logger.info(`Successfully confirmed payment for SPPT ${spptId}`);
    return updatedRecord;
  }

  /**
   * Validates a PBB record before payment confirmation.
   * @param {string} spptId - The SPPT ID.
   * @returns {object} Validation result.
   */
  validatePayment(spptId) {
    this.permission.check('pbb.payment.validate');
    this.logger.info(`Validating payment for SPPT: ${spptId}`);

    const sppt = this.getSPPT(spptId);

    // Check if already paid
    if (sppt.paymentStatus === 'LUNAS') {
      throw new Error('SPPT has already been paid.');
    }

    // Check if payment is overdue
    const isOverdue = new Date(sppt.dueDate) < new Date();
    if (isOverdue && sppt.paymentStatus !== 'MENUNGGAK') {
      this.logger.warn(`SPPT ${spptId} is overdue. PaymentStatus: ${sppt.paymentStatus}`);
    }

    const validation = {
      valid: true,
      spptId,
      isOverdue,
      paymentStatus: sppt.paymentStatus,
      dueDate: sppt.dueDate,
      taxAmount: sppt.taxAmount,
      arrearsAmount: sppt.arrearsAmount,
    };

    // Determine if payment installment is needed
    if (sppt.arrearsAmount > sppt.taxAmount && !sppt.paymentProof) {
      validation.needInstallment = true;
    }

    this.logger.info(`Payment validation result for SPPT ${spptId}: ${validation.valid}`);
    return validation;
  }

  /**
   * Marks PBB records as overdue.
   * @param {object} [filters] - Filters to identify records to mark overdue.
   * @returns {object} Summary with updated records.
   */
  markOverdue(filters = {}) {
    this.permission.check('pbb.overdue.mark');
    this.logger.info(`Marking overdue PBB records with filters: ${JSON.stringify(filters)}`);

    const records = this.repository.search(filters);
    
    let updatedCount = 0;
    const now = new Date().toISOString();

    records.forEach(record => {
      // Only mark if not already paid or being collected
      if (record.paymentStatus === 'BELUM LUNAS' || record.paymentStatus === 'MENUNGGAK') {
        this.repository.update(record.id, {
          paymentStatus: 'MENUNGGAK',
          updatedAt: now,
          updatedBy: WK.user().id,
        });
        updatedCount++;
        
        this.eventBus.publish('SpptMarkedOverdue', {
          source: 'PBBService',
          payload: record.id,
        });
      }
    });

    this.analyticsService.track('sppt_marked_overdue', {
      updatedCount,
      filters,
    });

    this.logger.info(`Marked ${updatedCount} PBB records as overdue`);
    return { updatedCount, totalRecords: records.length };
  }

  /**
   * Deletes a PBB record (soft delete).
   * @param {string} id - The ID of the PBB record.
   * @returns {object} Deletion result.
   */
  deletePBB(id) {
    this.permission.check('pbb.sppt.delete');
    this.logger.info(`Deleting PBB record: ${id}`);

    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`PBB record with ID ${id} not found.`);
    }

    this.repository.delete(id, WK.user().id);

    this.eventBus.publish('SpptDeleted', {
      source: 'PBBService',
      payload: record,
    });

    this.logger.info(`Successfully deleted PBB record ${id}`);
    return { success: true, id };
  }

  /**
   * Updates the object category of a PBB record.
   * @param {string} id - The ID of the PBB record.
   * @param {string} objectCategory - The new object category.
   * @returns {PBB} The updated PBB record.
   */
  updateObjectCategory(id, objectCategory) {
    this.permission.check('pbb.category.update');
    this.logger.info(`Updating object category for SPPT: ${id}`);

    const categoryUpper = objectCategory.toUpperCase();
    if (!PBBConstants.OBJECT_CATEGORIES.includes(categoryUpper)) {
      throw new Error(`Invalid object category. Must be one of: ${PBBConstants.OBJECT_CATEGORIES.join(', ')}`);
    }

    const updatedRecord = this.repository.update(id, {
      objectCategory: categoryUpper,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('SpptCategoryUpdated', {
      source: 'PBBService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }
}

module.exports = PBBService;
