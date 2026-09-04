/**
 * @file PBBService.js
 * @description Application service for PBB tax management, SPPT issuance, payment confirmation, and verification.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

const { PBBObject, PBBBill, PBBPayment } = require('./PBBEntity.js');
const { PBBPermission } = require('./PBBPermission.js');
const { PBBRule } = require('./PBBRule.js');
const { PBBValidator } = require('./PBBValidator.js');

class PBBService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new PBBPermission();
    this.rule = new PBBRule();
    this.validator = new PBBValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PBBService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Register a new Tax Object (NOP 18-digit).
   * @param {Object} payload
   * @param {Object} context
   * @returns {PBBObject}
   */
  registerPBBObject(payload = {}, context = {}) {
    this.validator.validateObjectRegistration(payload);

    const cleanNop = payload.nop.replace(/[\s.-]/g, '');

    const existing = this.repository ? this.repository.findObjectByNop(cleanNop) : null;
    if (existing) {
      throw new Error(`PBB Object already registered with NOP: ${cleanNop}`);
    }

    const pbbObject = new PBBObject({
      nop: cleanNop,
      taxpayerCitizenId: payload.taxpayerCitizenId,
      taxpayerName: payload.taxpayerName || '',
      objectAddress: payload.objectAddress,
      landAreaSqm: payload.landAreaSqm,
      buildingAreaSqm: payload.buildingAreaSqm,
      njopTotal: payload.njopTotal,
      category: payload.category || 'PERUMAHAN',
    });

    const saved = this.repository.createObject(pbbObject);

    if (this.logger && this.logger.info) {
      this.logger.info(`PBB Object registered: NOP ${saved.nop} for taxpayer ${saved.taxpayerCitizenId}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('PBBObjectRegistered', saved.toObject());
    }

    return saved;
  }

  /**
   * Import/Issue an annual SPPT tax bill for a registered NOP.
   * @param {Object} payload
   * @param {Object} context
   * @returns {PBBBill}
   */
  importSPPT(payload = {}, context = {}) {
    this.permission.checkImportSPPT(context);

    if (!payload.nop) throw new Error('Validation Error: nop is required');
    const cleanNop = payload.nop.replace(/[\s.-]/g, '');

    if (!payload.dueDate) throw new Error('Validation Error: dueDate is required');
    if (payload.taxAmount === undefined || payload.taxAmount === null || Number(payload.taxAmount) <= 0) {
      throw new Error('Validation Error: taxAmount must be a positive number');
    }

    const objectEntity = this.repository ? this.repository.findObjectByNop(cleanNop) : null;
    if (!objectEntity) {
      throw new Error(`PBB Object not found for NOP: ${cleanNop}`);
    }

    const bill = new PBBBill({
      nop: cleanNop,
      taxYear: payload.taxYear || new Date().getFullYear(),
      taxAmount: payload.taxAmount,
      dueDate: payload.dueDate,
      status: 'UNPAID',
      arrearsAmount: payload.arrearsAmount || 0,
    });

    const saved = this.repository.createBill(bill);

    if (this.logger && this.logger.info) {
      this.logger.info(`PBB SPPT Bill issued: ${saved.id} for NOP ${saved.nop} (Year: ${saved.taxYear}, Amount: Rp${saved.taxAmount})`);
    }

    if (this.eventBus) {
      this.eventBus.publish('PBBSPPTIssued', saved.toObject());
    }

    return saved;
  }

  /**
   * Citizen uploads/confirms PBB payment proof for a bill.
   * @param {Object} payload
   * @param {string} citizenId
   * @param {Object} context
   * @returns {{ bill: PBBBill, payment: PBBPayment }}
   */
  confirmPayment(payload = {}, citizenId, context = {}) {
    this.permission.checkConfirmPayment(context);
    this.validator.validatePaymentConfirmation(payload);

    const bill = this.repository.findBillById(payload.billId);
    if (!bill) throw new Error(`PBB Bill not found with ID: ${payload.billId}`);

    bill.status = 'PENDING_VERIFICATION';
    this.repository.updateBill(bill);

    const payment = new PBBPayment({
      billId: bill.id,
      nop: bill.nop,
      paidAmount: payload.paidAmount,
      paymentProofUrl: payload.paymentProofUrl,
      notes: payload.notes || null,
    });

    const savedPayment = this.repository.savePayment(payment);

    if (this.logger && this.logger.info) {
      this.logger.info(`PBB Payment submitted: ${savedPayment.id} for bill ${bill.id} (Status: PENDING_VERIFICATION)`);
    }

    if (this.eventBus) {
      this.eventBus.publish('PBBPaymentSubmitted', {
        bill: bill.toObject(),
        payment: savedPayment.toObject(),
      });
    }

    return { bill, payment: savedPayment };
  }

  /**
   * RT / Kelurahan official verifies payment proof.
   * @param {string} billId
   * @param {string} decision - 'APPROVE' or 'REJECT'
   * @param {string} verifierId
   * @param {Object} context
   * @returns {PBBBill}
   */
  verifyPayment(billId, decision, verifierId, context = {}) {
    this.permission.checkVerifyPayment(context);

    const bill = this.repository.findBillById(billId);
    if (!bill) throw new Error(`PBB Bill not found with ID: ${billId}`);

    const latestPayment = this.repository.findLatestPaymentByBillId(billId);

    if (decision === 'APPROVE') {
      bill.status = 'PAID';
      bill.paymentDate = new Date().toISOString().slice(0, 10);
      this.repository.updateBill(bill);

      if (latestPayment) {
        latestPayment.verifiedBy = verifierId;
        latestPayment.verifiedAt = new Date().toISOString();
        this.repository.updatePayment(latestPayment);
      }

      const governanceScoreDelta = this.rule.calculateGovernanceScore('PAID');

      if (this.logger && this.logger.info) {
        this.logger.info(`PBB Payment verified & APPROVED: Bill ${bill.id} (Status: PAID, Score Delta: +${governanceScoreDelta})`);
      }

      if (this.eventBus) {
        this.eventBus.publish('PBBPaymentVerified', {
          billId: bill.id,
          nop: bill.nop,
          status: 'PAID',
          governanceScoreDelta,
          verifiedBy: verifierId,
        });
      }
    } else if (decision === 'REJECT') {
      const escalation = this.rule.checkBillEscalation(bill.dueDate);
      bill.status = escalation.action === 'ESCALATE_OVERDUE' ? 'OVERDUE' : 'UNPAID';
      this.repository.updateBill(bill);

      if (this.logger && this.logger.info) {
        this.logger.info(`PBB Payment REJECTED: Bill ${bill.id} reverted to ${bill.status}`);
      }

      if (this.eventBus) {
        this.eventBus.publish('PBBPaymentRejected', {
          billId: bill.id,
          nop: bill.nop,
          status: bill.status,
          rejectedBy: verifierId,
        });
      }
    } else {
      throw new Error(`Invalid decision '${decision}'. Allowed: 'APPROVE' or 'REJECT'.`);
    }

    return bill;
  }

  /**
   * Cron/Scheduler process to check due dates and transition unpaid bills to OVERDUE.
   * @returns {number} Count of overdue bills escalated.
   */
  processEscalations() {
    const unpaidBills = this.repository ? this.repository.findBillsByStatus('UNPAID') : [];
    let count = 0;

    unpaidBills.forEach(bill => {
      const evalResult = this.rule.checkBillEscalation(bill.dueDate);
      if (evalResult.action === 'ESCALATE_OVERDUE') {
        bill.status = 'OVERDUE';
        const governanceScoreDelta = this.rule.calculateGovernanceScore('OVERDUE');
        this.repository.updateBill(bill);

        if (this.logger && this.logger.info) {
          this.logger.info(`PBB Bill escalated to OVERDUE: Bill ${bill.id} for NOP ${bill.nop} (Score Delta: ${governanceScoreDelta})`);
        }

        if (this.eventBus) {
          this.eventBus.publish('PBBOverdueEscalated', {
            billId: bill.id,
            nop: bill.nop,
            status: 'OVERDUE',
            governanceScoreDelta,
          });
        }
        count++;
      }
    });

    return count;
  }
}

module.exports = { PBBService };

