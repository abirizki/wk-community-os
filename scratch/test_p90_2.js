/**
 * Scratch test: IMP-P90.2 — PBB Service & Support Layer Acceptance Check
 */

class MockDb {
  constructor() { this.store = {}; }
  create(table, data) {
    if (!this.store[table]) this.store[table] = [];
    this.store[table].push(JSON.parse(JSON.stringify(data)));
    return data;
  }
  findOne(table, criteria) {
    if (!this.store[table]) return null;
    const r = this.store[table].find(item => Object.keys(criteria).every(k => item[k] === criteria[k]));
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }
  update(table, criteria, data) {
    if (!this.store[table]) return null;
    const r = this.store[table].find(item => Object.keys(criteria).every(k => item[k] === criteria[k]));
    if (r) Object.assign(r, JSON.parse(JSON.stringify(data)));
    return r;
  }
  search(table, criteria) {
    if (!this.store[table]) return [];
    if (!criteria || Object.keys(criteria).length === 0) return this.store[table].map(i => JSON.parse(JSON.stringify(i)));
    return this.store[table].filter(item => Object.keys(criteria).every(k => item[k] === criteria[k])).map(i => JSON.parse(JSON.stringify(i)));
  }
}

const mockDb = new MockDb();
const mockSecurity = { checkPermission: () => true };
const mockEventBus = { publish: (ev, data) => console.log(`  [EventBus] ${ev}`) };
const mockLogger = { info: (msg) => console.log(`  [Logger] ${msg}`) };

global.WK = {
  database: () => mockDb,
  security: () => mockSecurity,
  logger: () => mockLogger,
  service: (name) => (name === 'eventbus' ? mockEventBus : null),
};

const { PBBPermission } = require('../packages/PBB/PBBPermission.js');
const { PBBRule } = require('../packages/PBB/PBBRule.js');
const { PBBValidator } = require('../packages/PBB/PBBValidator.js');
const { PBBRepository } = require('../packages/PBB/PBBRepository.js');
const { PBBService } = require('../packages/PBB/PBBService.js');

let passed = 0; let failed = 0;
const assert = (c, m) => {
  if (c) { console.log(`  ✓ ${m}`); passed++; }
  else { console.error(`  ✗ ${m}`); failed++; }
};

console.log('\n--- 1. Testing NOP Format Validation & Rules ---');
const rule = new PBBRule();
assert(rule.validateNopFormat('327201000100101230') === true, 'Valid 18-digit numeric NOP passes');
assert(rule.validateNopFormat('32.72.010.001.001.0123.0') === true, 'NOP with dots formatted clean passes');
assert(rule.validateNopFormat('12345') === false, 'Invalid short NOP rejected');

assert(rule.calculateGovernanceScore('PAID') === 1, 'PAID status yields +1 Governance Score');
assert(rule.calculateGovernanceScore('OVERDUE') === -2, 'OVERDUE status yields -2 Governance Score');

console.log('\n--- 2. Testing Registration & SPPT Issuance ---');
const repo = new PBBRepository();
const service = new PBBService(repo);

const pbbObj = service.registerPBBObject({
  nop: '32.72.010.001.001.0123.0',
  taxpayerCitizenId: '3273010101900001',
  taxpayerName: 'Budi Santoso',
  objectAddress: 'Jl. Merdeka No. 10',
  landAreaSqm: 150,
  buildingAreaSqm: 90,
  njopTotal: 250000000,
});
assert(pbbObj.nop === '327201000100101230', 'registerPBBObject normalizes NOP');

const bill = service.importSPPT({
  nop: '327201000100101230',
  taxYear: 2026,
  taxAmount: 250000,
  dueDate: '2026-09-30',
});
assert(bill.status === 'UNPAID', 'importSPPT issues bill with UNPAID status');

console.log('\n--- 3. Testing Citizen Payment Confirmation ---');
const { bill: updatedBill, payment } = service.confirmPayment({
  billId: bill.id,
  nop: bill.nop,
  paidAmount: 250000,
  paymentProofUrl: '/proofs/pbb_2026.jpg',
}, '3273010101900001');

assert(updatedBill.status === 'PENDING_VERIFICATION', 'confirmPayment transitions bill status to PENDING_VERIFICATION');
assert(payment.paidAmount === 250000, 'confirmPayment records payment proof');

console.log('\n--- 4. Testing Official Verification & Score Delta ---');
const verifiedBill = service.verifyPayment(bill.id, 'APPROVE', '3273010101800001');
assert(verifiedBill.status === 'PAID', 'verifyPayment APPROVE transitions status to PAID');
assert(!!verifiedBill.paymentDate, 'verifyPayment records paymentDate');

console.log('\n--- 5. Testing Overdue Escalation Cron ---');
const pastBill = service.importSPPT({
  nop: '327201000100101230',
  taxYear: 2025,
  taxAmount: 200000,
  dueDate: '2025-08-01', // Past due!
});

const escalatedCount = service.processEscalations();
assert(escalatedCount === 1, 'processEscalations finds 1 overdue bill');
const refetchedPastBill = repo.findBillById(pastBill.id);
assert(refetchedPastBill.status === 'OVERDUE', 'processEscalations transitions bill status to OVERDUE');

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

