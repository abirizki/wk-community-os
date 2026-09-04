/**
 * @class PBBService
 * @description The main service for the PBB module, handling all business logic.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBService {
  /**
   * @param {TaxObjectRepository} taxObjectRepository
   * @param {TaxpayerRepository} taxpayerRepository
   * @param {SPPTRepository} spptRepository
   * @param {PaymentHistoryRepository} paymentHistoryRepository
   * @param {PBBValidator} pbbValidator
   * @param {CitizenService} citizenService
   * @param {HouseholdService} householdService
   */
  constructor(
    taxObjectRepository,
    taxpayerRepository,
    spptRepository,
    paymentHistoryRepository,
    pbbValidator,
    citizenService,
    householdService
  ) {
    /** @private */
    this.taxObjectRepository = taxObjectRepository;
    /** @private */
    this.taxpayerRepository = taxpayerRepository;
    /** @private */
    this.spptRepository = spptRepository;
    /** @private */
    this.paymentHistoryRepository = paymentHistoryRepository;
    /** @private */
    this.pbbValidator = pbbValidator;
    /** @private */
    this.citizenService = citizenService; // From Citizen package
    /** @private */
    this.householdService = householdService; // From Household package
    /** @private */
    this.eventBus = WK.service('eventbus');
    /** @private */
    this.workflowService = WK.service('workflow');
    /** @private */
    this.notificationService = WK.service('notification');
  }

  // --- Tax Object (NOP) Management ---

  /**
   * Registers a new Tax Object (NOP).
   * @param {object} data - Tax object data.
   * @returns {TaxObjectEntity} The created tax object.
   */
  registerTaxObject(data) {
    WK.security().checkPermission('pbb.tax_object.create');
    this.pbbValidator.validateTaxObjectRegistration(data);

    const owner = this.citizenService.getCitizenById(data.ownerCitizenId);
    if (!owner) throw new Error('Owner citizen not found.');

    const newTaxObject = this.taxObjectRepository.create(new TaxObjectEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...data
    }));

    this.eventBus.publish({
      eventType: 'PBB.TaxObject.Registered',
      module: 'pbb',
      referenceId: newTaxObject.id,
      payload: { taxObject: newTaxObject }
    });

    return newTaxObject;
  }

  /**
   * Retrieves a tax object by its ID.
   * @param {string} id - The ID of the tax object.
   * @returns {TaxObjectEntity|null}
   */
  getTaxObjectById(id) {
    WK.security().checkPermission('pbb.tax_object.view');
    return this.taxObjectRepository.findById(id);
  }

  // --- Taxpayer Management ---

  /**
   * Registers a new taxpayer.
   * @param {object} data - Taxpayer data.
   * @returns {TaxpayerEntity} The created taxpayer.
   */
  registerTaxpayer(data) {
    WK.security().checkPermission('pbb.taxpayer.create');
    this.pbbValidator.validateTaxpayerRegistration(data);

    const citizen = this.citizenService.getCitizenById(data.citizenId);
    if (!citizen) throw new Error('Citizen not found.');

    const newTaxpayer = this.taxpayerRepository.create(new TaxpayerEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...data
    }));

    this.eventBus.publish({
      eventType: 'PBB.Taxpayer.Registered',
      module: 'pbb',
      referenceId: newTaxpayer.id,
      payload: { taxpayer: newTaxpayer }
    });

    return newTaxpayer;
  }

  /**
   * Retrieves a taxpayer by citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {TaxpayerEntity|null}
   */
  getTaxpayerByCitizenId(citizenId) {
    WK.security().checkPermission('pbb.taxpayer.view');
    return this.taxpayerRepository.findByCitizenId(citizenId);
  }

  // --- SPPT Management ---

  /**
   * Issues a new SPPT for a tax object and taxpayer.
   * @param {object} data - SPPT data.
   * @returns {SPPTEntity} The issued SPPT.
   */
  issueSPPT(data) {
    WK.security().checkPermission('pbb.sppt.issue');
    this.pbbValidator.validateSPPTIssuance(data);

    const taxpayer = this.taxpayerRepository.findById(data.taxpayerId);
    if (!taxpayer) throw new Error('Taxpayer not found.');
    const taxObject = this.taxObjectRepository.findById(data.taxObjectId);
    if (!taxObject) throw new Error('Tax object not found.');

    const newSPPT = this.spptRepository.create(new SPPTEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      spptNumber: this._generateSpptNumber(data.taxYear, taxObject.nop),
      status: 'ISSUED',
      ...data
    }));

    this.eventBus.publish({
      eventType: 'PBB.SPPT.Issued',
      module: 'pbb',
      referenceId: newSPPT.id,
      payload: { sppt: newSPPT }
    });

    // Notify taxpayer about new SPPT
    this.notificationService.createAndQueue({
      recipientId: taxpayer.citizenId,
      channel: 'INBOX',
      type: 'PBB_SPPT_ISSUED',
      title: `SPPT PBB Tahun ${newSPPT.taxYear} Telah Diterbitkan`,
      body: `SPPT Anda dengan nomor ${newSPPT.spptNumber} untuk NOP ${taxObject.nop} telah diterbitkan. Jumlah pajak terutang Rp ${newSPPT.taxAmount.toLocaleString('id-ID')}. Jatuh tempo pada ${new Date(newSPPT.dueDate).toLocaleDateString('id-ID')}.`
    });

    return newSPPT;
  }

  /**
   * Generates a unique SPPT number.
   * @private
   * @param {number} taxYear - The tax year.
   * @param {string} nop - The NOP.
   * @returns {string} Generated SPPT number.
   */
  _generateSpptNumber(taxYear, nop) {
    const randomSuffix = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `SPPT-${taxYear}-${nop.replace(/\./g, '')}-${randomSuffix}`;
  }

  /**
   * Retrieves an SPPT by its ID.
   * @param {string} id - The ID of the SPPT.
   * @returns {SPPTEntity|null}
   */
  getSPPTById(id) {
    WK.security().checkPermission('pbb.sppt.view');
    return this.spptRepository.findById(id);
  }

  // --- Payment Management ---

  /**
   * Records a payment for an SPPT.
   * @param {string} spptId - The ID of the SPPT being paid.
   * @param {object} paymentData - Payment details.
   * @returns {PaymentHistoryEntity} The recorded payment.
   */
  recordPayment(spptId, paymentData) {
    WK.security().checkPermission('pbb.payment.record');
    this.pbbValidator.validatePaymentRecord(paymentData);

    const sppt = this.spptRepository.findById(spptId);
    if (!sppt) throw new Error('SPPT not found.');
    if (sppt.status === 'PAID') throw new Error('SPPT already paid.');

    const newPayment = this.paymentHistoryRepository.create(new PaymentHistoryEntity({
      id: WK.helper().generateUuid(),
      spptId: spptId,
      createdAt: new Date().toISOString(),
      status: 'SUCCESS', // Assume success for now
      ...paymentData
    }));

    // Update SPPT status to PAID
    this.spptRepository.update(spptId, { status: 'PAID', updatedAt: new Date().toISOString() });

    this.eventBus.publish({
      eventType: 'PBB.Payment.Recorded',
      module: 'pbb',
      referenceId: newPayment.id,
      payload: { payment: newPayment, spptId: spptId }
    });

    // Notify taxpayer about successful payment
    this.notificationService.createAndQueue({
      recipientId: sppt.taxpayerId, // Assuming taxpayerId is citizenId
      channel: 'INBOX',
      type: 'PBB_PAYMENT_CONFIRMED',
      title: `Pembayaran SPPT PBB Tahun ${sppt.taxYear} Berhasil`,
      body: `Pembayaran Anda untuk SPPT nomor ${sppt.spptNumber} sebesar Rp ${newPayment.paymentAmount.toLocaleString('id-ID')} telah berhasil diterima.`
    });

    return newPayment;
  }

  // --- Arrears Monitoring ---

  /**
   * Identifies and retrieves all overdue SPPTs.
   * @returns {SPPTEntity[]} An array of overdue SPPTs.
   */
  getOverdueSPPTs() {
    WK.security().checkPermission('pbb.arrears.view');
    const today = new Date().toISOString();
    return this.spptRepository.findAll({ status: 'ISSUED', dueDate: { $lt: today } });
  }

  /**
   * Triggers a workflow for arrears follow-up.
   * @param {string} spptId - The ID of the overdue SPPT.
   * @param {string} initiatedBy - The user initiating the follow-up.
   * @returns {object} Workflow initiation result.
   */
  initiateArrearsFollowUp(spptId, initiatedBy) {
    WK.security().checkPermission('pbb.arrears.followup');
    const sppt = this.spptRepository.findById(spptId);
    if (!sppt) throw new Error('SPPT not found.');
    if (sppt.status !== 'OVERDUE' && new Date(sppt.dueDate) > new Date()) {
      throw new Error('SPPT is not overdue.');
    }

    // Update SPPT status to OVERDUE if not already
    if (sppt.status !== 'OVERDUE') {
      this.spptRepository.update(spptId, { status: 'OVERDUE', updatedAt: new Date().toISOString() });
    }

    const workflowResult = this.workflowService.startWorkflow(
      'PBB_ARREARS_FOLLOWUP',
      spptId,
      initiatedBy,
      { spptNumber: sppt.spptNumber, taxpayerId: sppt.taxpayerId, taxAmount: sppt.taxAmount }
    );

    this.eventBus.publish({
      eventType: 'PBB.Arrears.FollowUpInitiated',
      module: 'pbb',
      referenceId: spptId,
      payload: { spptId: spptId, initiatedBy: initiatedBy }
    });

    return workflowResult;
  }
}