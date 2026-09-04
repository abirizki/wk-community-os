/**
 * Scratch test: IMP-P80.2 — Posyandu Service & Support Layer Acceptance Check
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

const { PosyanduPermission } = require('../packages/Posyandu/PosyanduPermission.js');
const { PosyanduRule } = require('../packages/Posyandu/PosyanduRule.js');
const { PosyanduValidator } = require('../packages/Posyandu/PosyanduValidator.js');
const { PosyanduRepository } = require('../packages/Posyandu/PosyanduRepository.js');
const { PosyanduService } = require('../packages/Posyandu/PosyanduService.js');

let passed = 0; let failed = 0;
const assert = (c, m) => {
  if (c) { console.log(`  ✓ ${m}`); passed++; }
  else { console.error(`  ✗ ${m}`); failed++; }
};

console.log('\n--- 1. Testing Permission & Validator ---');
const perm = new PosyanduPermission();
assert(PosyanduPermission.getPermissions().length === 6, 'PosyanduPermission defines 6 permissions');

const val = new PosyanduValidator();
try {
  val.validateMemberRegistration({
    citizenId: '3273010101230001',
    parentCitizenId: '3273010101900001',
    targetGroup: 'BALITA',
    posyanduName: 'Posyandu Melati',
    dateOfBirth: '2025-01-01',
    gender: 'L',
  });
  assert(true, 'validateMemberRegistration passes valid payload');
} catch (e) { assert(false, `validateMemberRegistration failed: ${e.message}`); }

try {
  val.validateMemberRegistration({
    citizenId: '3273010101230001',
    targetGroup: 'BALITA',
    posyanduName: 'Posyandu Melati',
    dateOfBirth: '2025-01-01',
    gender: 'L',
  });
  assert(false, 'Should reject BALITA registration without parentCitizenId');
} catch (e) { assert(true, 'Validator strictly requires parentCitizenId for BALITA'); }

console.log('\n--- 2. Testing Rule Layer Health Evaluations ---');
const rule = new PosyanduRule();
const stuntingEval = rule.evaluateNutritionAndStunting(24, 13.0, 88.0);
assert(stuntingEval.nutritionStatus === 'GIZI_BAIK', 'Nutrition evaluation computes GIZI_BAIK');
assert(stuntingEval.stuntingStatus === 'NORMAL', 'Stunting evaluation computes NORMAL');

const stuntedEval = rule.evaluateNutritionAndStunting(24, 7.0, 65.0);
assert(stuntedEval.stuntingStatus === 'SEVERELY_STUNTED', 'Severe short height computes SEVERELY_STUNTED');
assert(stuntedEval.nutritionStatus === 'GIZI_BURUK', 'Severe low weight computes GIZI_BURUK');

assert(rule.evaluateHighRiskBumil(21.0, 120) === true, 'LILA < 23.5 flags high risk bumil (KEK)');
assert(rule.evaluateHighRiskBumil(25.0, 150) === true, 'Systolic >= 140 flags high risk bumil (Hypertension)');
assert(rule.evaluateHighRiskBumil(25.0, 120) === false, 'Normal bumil is not high risk');

console.log('\n--- 3. Testing Service End-to-End Registration & Visit ---');
const repo = new PosyanduRepository();
const service = new PosyanduService(repo);

// Register Balita
const balita = service.registerMember({
  citizenId: '3273010101240001',
  parentCitizenId: '3273010101900001',
  targetGroup: 'BALITA',
  posyanduName: 'Posyandu Mawar RW 01',
  dateOfBirth: '2025-06-01',
  gender: 'P',
});
assert(balita.targetGroup === 'BALITA', 'registerMember creates member in repository');

// Record Visit 1: Healthy
const visit1 = service.recordVisit({
  memberId: balita.id,
  visitDate: '2026-08-01',
  weightKg: 10.0,
  heightCm: 78.0,
  headCircumferenceCm: 45.0,
  vitaminOrPMT: 'Vitamin A Kapsul Biru',
  immunizationGiven: 'POLIO_1',
});
assert(visit1.status === 'COMPLETED', 'Healthy visit marked as COMPLETED');
assert(visit1.isHighRisk === false, 'Healthy visit isHighRisk is false');

// Record Visit 2: Weight Stagnation & Risk
const visit2 = service.recordVisit({
  memberId: balita.id,
  visitDate: '2026-09-01',
  weightKg: 10.0, // Stagnant weight!
  heightCm: 78.5,
});
assert(visit2.status === 'FOLLOW_UP_NEEDED', 'Stagnant weight transitions status to FOLLOW_UP_NEEDED');
assert(visit2.isHighRisk === true, 'Stagnant visit flags isHighRisk');

// Test Privacy History Retrieval
const history = service.getMemberHistory(balita.id, '3273010101900001'); // Requested by parent
assert(history.member.citizenId === '************0001', 'getMemberHistory masks child NIK');
assert(history.member.parentCitizenId === '************0001', 'getMemberHistory masks parent NIK');
assert(history.records.length === 2, 'getMemberHistory returns 2 visits');

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

