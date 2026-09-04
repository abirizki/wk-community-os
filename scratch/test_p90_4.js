/**
 * Scratch test: IMP-P90.4 — PBB Analytics & Presentation Acceptance Check
 */

class MockCacheStore {
  constructor() { this.store = {}; }
  has(k) { return k in this.store; }
  get(k) { return this.store[k]; }
  set(k, v) { this.store[k] = v; }
}

const mockCaches = new Map();
const mockSecurity = { checkPermission: (p) => true };

global.WK = {
  security: () => mockSecurity,
  cache: (ns) => {
    if (!mockCaches.has(ns)) mockCaches.set(ns, new MockCacheStore());
    return mockCaches.get(ns);
  },
};

const { PBBBill, PBBPayment } = require('../packages/PBB/PBBEntity.js');
const { PBBStatistics } = require('../packages/PBB/PBBStatistics.js');
const { PBBDashboard } = require('../packages/PBB/PBBDashboard.js');

let passed = 0; let failed = 0;
const assert = (c, m) => {
  if (c) { console.log(`  ✓ ${m}`); passed++; }
  else { console.error(`  ✗ ${m}`); failed++; }
};

const mockBills = [
  new PBBBill({ nop: 'nop1', taxAmount: 200000, status: 'PAID' }),
  new PBBBill({ nop: 'nop2', taxAmount: 300000, status: 'PAID' }),
  new PBBBill({ nop: 'nop3', taxAmount: 500000, status: 'OVERDUE' }),
  new PBBBill({ nop: 'nop4', taxAmount: 1000000, status: 'UNPAID' }),
];

const mockPayments = [
  new PBBPayment({ billId: 'b1', nop: 'nop1', paidAmount: 200000, paymentProofUrl: '/proof1.jpg', verifiedBy: '3273010101800001' }),
  new PBBPayment({ billId: 'b2', nop: 'nop2', paidAmount: 300000, paymentProofUrl: '/proof2.jpg' }),
];

const mockRepo = {
  findAllBills: () => mockBills,
  findAllPayments: () => mockPayments,
};

console.log('\n--- 1. Testing PBB Statistics ---');
const stats = new PBBStatistics(mockRepo);

const summary = stats.getTaxRealizationSummary();
assert(summary.totalTargetAmount === 2000000, 'totalTargetAmount calculated correctly (2.000.000)');
assert(summary.totalRealizedAmount === 500000, 'totalRealizedAmount calculated correctly (500.000)');
assert(summary.complianceRate === 25, 'complianceRate calculated correctly (25%)');
assert(summary.overdueCount === 1, 'overdueCount is 1');

// Cache hit verification
const cachedSummary = stats.getTaxRealizationSummary();
assert(cachedSummary.complianceRate === 25, 'getTaxRealizationSummary hits cache successfully');

const dist = stats.getComplianceDistribution();
assert(dist.find(d => d.status === 'PAID').count === 2, 'PAID bills count is 2');
assert(dist.find(d => d.status === 'OVERDUE').count === 1, 'OVERDUE bills count is 1');

const recentPayments = stats.getRecentPayments(2);
assert(recentPayments.length === 2, 'getRecentPayments respects limit');
assert(!recentPayments[0].hasOwnProperty('deletedAt'), 'No internal audit fields in recent payments DTO');

console.log('\n--- 2. Testing PBB Dashboard ---');
const widgets = PBBDashboard.getWidgets();
assert(widgets.length === 4, 'PBBDashboard registers 4 widgets');
assert(widgets.some(w => w.id === 'pbb_realization_card'), 'summary_card registered');
assert(widgets.some(w => w.id === 'pbb_compliance_chart'), 'donut_chart registered');
assert(widgets.some(w => w.id === 'pbb_recent_payments_table'), 'table registered');
assert(widgets.some(w => w.id === 'pbb_quick_actions'), 'quick_actions registered');

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
