/**
 * Scratch test: IMP-P80.4 — Posyandu Analytics & Presentation Acceptance Check
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

const { PosyanduMember, PosyanduRecord } = require('../packages/Posyandu/PosyanduEntity.js');
const { PosyanduStatistics } = require('../packages/Posyandu/PosyanduStatistics.js');
const { PosyanduDashboard } = require('../packages/Posyandu/PosyanduDashboard.js');

let passed = 0; let failed = 0;
const assert = (c, m) => {
  if (c) { console.log(`  ✓ ${m}`); passed++; }
  else { console.error(`  ✗ ${m}`); failed++; }
};

// Mock repository
const mockMembers = [
  new PosyanduMember({ id: 'm1', citizenId: '3273010101240001', parentCitizenId: '3273010101900001', targetGroup: 'BALITA' }),
  new PosyanduMember({ id: 'm2', citizenId: '3273010101240002', parentCitizenId: '3273010101900002', targetGroup: 'BALITA' }),
  new PosyanduMember({ id: 'm3', citizenId: '3273010101240003', targetGroup: 'IBU_HAMIL' }),
  new PosyanduMember({ id: 'm4', citizenId: '3273010101240004', targetGroup: 'LANSIA' }),
];

const mockRecords = [
  new PosyanduRecord({ memberId: 'm1', visitDate: '2026-08-01', weightKg: 10.0, heightCm: 80.0, nutritionStatus: 'GIZI_BAIK', stuntingStatus: 'NORMAL', status: 'COMPLETED', isHighRisk: false }),
  new PosyanduRecord({ memberId: 'm2', visitDate: '2026-08-02', weightKg: 7.0, heightCm: 65.0, nutritionStatus: 'GIZI_BURUK', stuntingStatus: 'STUNTED', status: 'FOLLOW_UP_NEEDED', isHighRisk: true, riskNotes: 'GIZI_BURUK & STUNTED' }),
  new PosyanduRecord({ memberId: 'm3', visitDate: '2026-08-03', weightKg: 55.0, heightCm: 155.0, armCircumferenceCm: 21.0, status: 'FOLLOW_UP_NEEDED', isHighRisk: true, riskNotes: 'KEK (LILA < 23.5)' }),
  new PosyanduRecord({ memberId: 'm4', visitDate: '2026-08-04', weightKg: 60.0, heightCm: 160.0, systolic: 160, status: 'FOLLOW_UP_NEEDED', isHighRisk: true, riskNotes: 'Hipertensi' }),
];

const mockRepo = {
  findAllMembers: () => mockMembers,
  findAllRecords: () => mockRecords,
  findMemberById: (id) => mockMembers.find(m => m.id === id) || null,
};

console.log('\n--- 1. Testing Posyandu Statistics ---');
const stats = new PosyanduStatistics(mockRepo);

const summary = stats.getHealthSummary();
assert(summary.totalMembers === 4, 'summary.totalMembers is 4');
assert(summary.stuntingCases === 1, 'summary.stuntingCases is 1');
assert(summary.malnutritionCases === 1, 'summary.malnutritionCases is 1');
assert(summary.highRiskPregnancies === 1, 'summary.highRiskPregnancies is 1');

// Cache test
const cachedSummary = stats.getHealthSummary();
assert(cachedSummary.totalMembers === 4, 'getHealthSummary hits cache successfully');

const nutDist = stats.getNutritionDistribution();
assert(nutDist.find(n => n.status === 'GIZI_BAIK').count === 1, 'GIZI_BAIK count is 1');
assert(nutDist.find(n => n.status === 'GIZI_BURUK').count === 1, 'GIZI_BURUK count is 1');

const followups = stats.getRecentFollowUps(3);
assert(followups.length === 3, 'getRecentFollowUps respects limit');
assert(!followups[0].hasOwnProperty('citizenId'), 'No raw NIK columns in recent follow-up table DTO');
assert(!followups[0].hasOwnProperty('deletedAt'), 'No internal audit fields in recent follow-up DTO');

console.log('\n--- 2. Testing Posyandu Dashboard ---');
const widgets = PosyanduDashboard.getWidgets();
assert(widgets.length === 4, 'PosyanduDashboard registers 4 widgets');
assert(widgets.some(w => w.id === 'health_summary_card'), 'summary_card registered');
assert(widgets.some(w => w.id === 'nutrition_donut_chart'), 'donut_chart registered');
assert(widgets.some(w => w.id === 'followup_records_table'), 'table registered');
assert(widgets.some(w => w.id === 'posyandu_quick_actions'), 'quick_actions registered');

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

