/**
 * @file PBBRepository.js
 * @description Data access layer for pbb_objects, pbb_bills, and pbb_payments tables.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

const { PBBObject, PBBBill, PBBPayment } = require('./PBBEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class PBBRepository extends BaseRepository {
  constructor() {
    super('pbb_objects');
    this.billTableName = 'pbb_bills';
    this.paymentTableName = 'pbb_payments';
  }

  // --- PBBObject Operations ---

  createObject(pbbObject) {
    if (!this.dbAdapter) return pbbObject;
    this.dbAdapter.create(this.tableName, pbbObject.toObject());
    return pbbObject;
  }

  updateObject(pbbObject) {
    if (!this.dbAdapter) return pbbObject;
    const obj = pbbObject.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: pbbObject.id }, obj);
    pbbObject.version = obj.version;
    pbbObject.updatedAt = obj.updatedAt;
    return pbbObject;
  }

  findObjectById(id) {
    if (!this.dbAdapter) return null;
    const rec = this.dbAdapter.findOne(this.tableName, { id });
    return rec ? PBBObject.fromObject(rec) : null;
  }

  findObjectByNop(nop) {
    if (!this.dbAdapter) return null;
    const cleanNop = nop.replace(/[\s.-]/g, '');
    const rec = this.dbAdapter.findOne(this.tableName, { nop: cleanNop });
    return rec ? PBBObject.fromObject(rec) : null;
  }

  findObjectsByCitizenId(taxpayerCitizenId) {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.tableName, { taxpayerCitizenId });
    return recs.map(r => PBBObject.fromObject(r));
  }

  findAllObjects() {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.tableName, {});
    return recs.map(r => PBBObject.fromObject(r));
  }

  // --- PBBBill Operations ---

  createBill(pbbBill) {
    if (!this.dbAdapter) return pbbBill;
    this.dbAdapter.create(this.billTableName, pbbBill.toObject());
    return pbbBill;
  }

  updateBill(pbbBill) {
    if (!this.dbAdapter) return pbbBill;
    const obj = pbbBill.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.billTableName, { id: pbbBill.id }, obj);
    pbbBill.version = obj.version;
    pbbBill.updatedAt = obj.updatedAt;
    return pbbBill;
  }

  findBillById(id) {
    if (!this.dbAdapter) return null;
    const rec = this.dbAdapter.findOne(this.billTableName, { id });
    return rec ? PBBBill.fromObject(rec) : null;
  }

  findBillsByNop(nop) {
    if (!this.dbAdapter) return [];
    const cleanNop = nop.replace(/[\s.-]/g, '');
    const recs = this.dbAdapter.search(this.billTableName, { nop: cleanNop });
    return recs.map(r => PBBBill.fromObject(r));
  }

  findBillsByCitizenId(taxpayerCitizenId) {
    const userObjects = this.findObjectsByCitizenId(taxpayerCitizenId);
    if (userObjects.length === 0) return [];
    const nops = new Set(userObjects.map(o => o.nop));
    const allBills = this.findAllBills();
    return allBills.filter(b => nops.has(b.nop));
  }

  findBillsByStatus(status) {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.billTableName, { status });
    return recs.map(r => PBBBill.fromObject(r));
  }

  findAllBills() {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.billTableName, {});
    return recs.map(r => PBBBill.fromObject(r));
  }

  // --- PBBPayment Operations ---

  createPayment(pbbPayment) {
    if (!this.dbAdapter) return pbbPayment;
    this.dbAdapter.create(this.paymentTableName, pbbPayment.toObject());
    return pbbPayment;
  }

  updatePayment(pbbPayment) {
    if (!this.dbAdapter) return pbbPayment;
    const obj = pbbPayment.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.paymentTableName, { id: pbbPayment.id }, obj);
    pbbPayment.version = obj.version;
    pbbPayment.updatedAt = obj.updatedAt;
    return pbbPayment;
  }

  savePayment(pbbPayment) {
    return this.createPayment(pbbPayment);
  }

  findPaymentById(id) {
    if (!this.dbAdapter) return null;
    const rec = this.dbAdapter.findOne(this.paymentTableName, { id });
    return rec ? PBBPayment.fromObject(rec) : null;
  }

  findPaymentsByBillId(billId) {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.paymentTableName, { billId });
    return recs.map(r => PBBPayment.fromObject(r));
  }

  findLatestPaymentByBillId(billId) {
    const list = this.findPaymentsByBillId(billId);
    return list.length > 0 ? list[list.length - 1] : null;
  }

  findAllPayments() {
    if (!this.dbAdapter) return [];
    const recs = this.dbAdapter.search(this.paymentTableName, {});
    return recs.map(r => PBBPayment.fromObject(r));
  }
}

module.exports = { PBBRepository };

