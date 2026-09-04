/**
 * @file FinancialService.js
 * @description Application service orchestrating financial rules, permissions, and persistence.
 */

const { DuesBill, CashTransaction } = require('./FinancialEntity.js');
const { FinancialPermission } = require('./FinancialPermission.js');
const { FinancialRule } = require('./FinancialRule.js');
const { FinancialValidator } = require('./FinancialValidator.js');

class FinancialService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new FinancialPermission();
    this.rule = new FinancialRule();
    this.validator = new FinancialValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('FinancialService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Generate DuesBill (PENDING) for each active family in a given period.
   * @param {string} period - YYYY-MM
   * @param {number} amount - nominal iuran
   * @param {Array}  activeFamilies - array of { id: familyId }
   */
  generateMonthlyBills(period, amount, activeFamilies = [], context = {}) {
    this.permission.checkGenerateBills(context);
    this.validator.validateGenerateBills({ period, amount });
    this.rule.checkValidPeriodFormat(period);
    this.rule.checkPositiveAmount(amount);

    const existingBills = this.repository.findBillsByPeriod(period);
    const created = [];

    activeFamilies.forEach(family => {
      try {
        this.rule.checkUniqueBill(family.id, period, existingBills);
        const bill = new DuesBill({ familyId: family.id, period, amount });
        this.repository.createBill(bill);
        created.push(bill);
      } catch (e) {
        if (this.logger.warn) this.logger.warn(`Skipping duplicate bill for family ${family.id} in ${period}: ${e.message}`);
      }
    });

    if (this.logger.info) this.logger.info(`Generated ${created.length} DuesBills for period ${period}`);
    if (this.eventBus) this.eventBus.publish('MonthlyBillsGenerated', { period, count: created.length });
    return created;
  }

  /**
   * Record dues payment. Automatically creates a CashTransaction (INCOME) in the ledger.
   * @param {string} billId
   * @param {Object} payload - { paidByUserId, notes? }
   */
  recordDuesPayment(billId, payload = {}, context = {}) {
    this.permission.checkRecordPayment(context);
    this.validator.validatePaymentRecord(payload);

    const bill = this.repository.findBillById(billId);
    if (!bill) throw new Error(`DuesBill not found: ${billId}`);

    // Enforce immutability of terminal statuses
    this.rule.checkTerminalStatus(bill.status);

    bill.status = 'PAID';
    bill.paidAt = new Date().toISOString();
    bill.paidByUserId = payload.paidByUserId;
    bill.notes = payload.notes || null;

    const updatedBill = this.repository.updateBill(bill);

    // ─── AUTO-LEDGER: Mandatory cash transaction for every dues payment ───
    const ledgerEntry = new CashTransaction({
      type: 'INCOME',
      category: 'IURAN_BULANAN',
      amount: bill.amount,
      description: `Iuran ${bill.period} - KK ${bill.familyId}`,
      referenceId: bill.id,
      transactionDate: new Date().toISOString().slice(0, 10),
      recordedByUserId: payload.paidByUserId,
    });
    this.repository.createTransaction(ledgerEntry);
    // ─────────────────────────────────────────────────────────────────────

    if (this.logger.info) this.logger.info(`DuesPayment recorded: bill ${billId} → PAID | Auto-ledger tx ${ledgerEntry.id}`);
    if (this.eventBus) this.eventBus.publish('DuesPaymentRecorded', { bill: updatedBill.toObject(), transaction: ledgerEntry.toObject() });

    return { bill: updatedBill, transaction: ledgerEntry };
  }

  /**
   * Waive a dues bill (no income ledger entry created).
   * @param {string} billId
   * @param {Object} payload - { notes?, waivedByUserId? }
   */
  waiveDues(billId, payload = {}, context = {}) {
    this.permission.checkWaiveDues(context);

    const bill = this.repository.findBillById(billId);
    if (!bill) throw new Error(`DuesBill not found: ${billId}`);

    this.rule.checkTerminalStatus(bill.status);

    bill.status = 'WAIVED';
    bill.notes = payload.notes || 'Dibebaskan oleh pengurus';

    const updated = this.repository.updateBill(bill);

    if (this.logger.info) this.logger.info(`DuesBill ${billId} waived`);
    if (this.eventBus) this.eventBus.publish('DuesWaived', updated.toObject());
    return updated;
  }

  /**
   * Record a manual cash transaction (income or expense).
   * @param {Object} payload - { type, category, amount, description, transactionDate, recordedByUserId }
   */
  recordManualTransaction(payload = {}, context = {}) {
    this.permission.checkCreateTransaction(context);
    this.validator.validateManualTransaction(payload);
    this.rule.checkValidTransactionType(payload.type);
    this.rule.checkValidTransactionCategory(payload.category);
    this.rule.checkPositiveAmount(payload.amount);

    const transaction = new CashTransaction(payload);
    const saved = this.repository.createTransaction(transaction);

    if (this.logger.info) this.logger.info(`Manual transaction recorded: ${saved.id} [${saved.type}/${saved.category}] Rp${saved.amount}`);
    if (this.eventBus) this.eventBus.publish('ManualTransactionRecorded', saved.toObject());
    return saved;
  }
}

module.exports = { FinancialService };

