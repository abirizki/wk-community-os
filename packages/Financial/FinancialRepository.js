/**
 * @file FinancialRepository.js
 * @description Data access layer for dues_bills and cash_transactions tables.
 */

const { DuesBill, CashTransaction } = require('./FinancialEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class FinancialRepository extends BaseRepository {
  constructor() {
    super('dues_bills');
    this.transactionTable = 'cash_transactions';
  }

  // ---- DuesBill operations ----

  createBill(bill) {
    if (!this.dbAdapter) return bill;
    this.dbAdapter.create(this.tableName, bill.toObject());
    return bill;
  }

  updateBill(bill) {
    if (!this.dbAdapter) return bill;
    const obj = bill.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: bill.id }, obj);
    bill.version = obj.version;
    bill.updatedAt = obj.updatedAt;
    return bill;
  }

  findBillById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return record ? DuesBill.fromObject(record) : null;
  }

  findBillsByPeriod(period) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { period });
    return records.map(r => DuesBill.fromObject(r));
  }

  findBillsByFamily(familyId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { familyId });
    return records.map(r => DuesBill.fromObject(r));
  }

  // ---- CashTransaction operations ----

  createTransaction(transaction) {
    if (!this.dbAdapter) return transaction;
    this.dbAdapter.create(this.transactionTable, transaction.toObject());
    return transaction;
  }

  findTransactionById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.transactionTable, { id });
    return record ? CashTransaction.fromObject(record) : null;
  }

  findTransactionByReference(referenceId) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.transactionTable, { referenceId });
    return record ? CashTransaction.fromObject(record) : null;
  }

  findAllTransactions() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.transactionTable, {});
    return records.map(r => CashTransaction.fromObject(r));
  }
}

module.exports = { FinancialRepository };

