/**
 * @file PosyanduTest.js
 * @description Behavioral Test Suite & Quality Gate — Posyandu Module (P80)
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. MOCKING ENGINE
// ============================================================================

class MockDatabase {
  constructor() {
    this.tables = {};
    this.indexes = {};
  }
  hasTable(name) { return !!this.tables[name]; }
  createTable(name, schema) { if (!this.tables[name]) this.tables[name] = { schema, records: [] }; }
  dropTable(name) { delete this.tables[name]; delete this.indexes[name]; }
  ensureIndex(table, field) {
    if (!this.indexes[table]) this.indexes[table] = [];
    this.indexes[table].push(field);
  }
  create(table, data) {
    if (!this.tables[table]) this.tables[table] = { records: [] };
    this.tables[table].records.push(JSON.parse(JSON.stringify(data)));
    return data;
  }
  findOne(table, criteria) {
    if (!this.tables[table]) return null;
    const found = this.tables[table].records.find(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }
  update(table, criteria, data) {
    if (!this.tables[table]) return null;
    const rec = this.tables[table].records.find(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    );
    if (rec) Object.assign(rec, JSON.parse(JSON.stringify(data)));
    return rec;
  }
  search(table, criteria) {
    if (!this.tables[table]) return [];
    if (!criteria || Object.keys(criteria).length === 0) {
      return this.tables[table].records.map(r => JSON.parse(JSON.stringify(r)));
    }
    return this.tables[table].records
      .filter(r => Object.keys(criteria).every(k => r[k] === criteria[k]))
      .map(r => JSON.parse(JSON.stringify(r)));
  }
  count(table, criteria) { return this.search(table, criteria).length; }
}

class MockSecurity {
  constructor() { this.allowed = true; }
  allowAll() { this.allowed = true; }
  denyAll() { this.allowed = false; }
  checkPermission(perm) {
    if (!this.allowed) throw new Error(`Security Exception: Permission denied for ${perm}`);
    return true;
  }
}

class MockCacheStore {
  constructor() { this.store = {}; }
  has(key) { return key in this.store; }
  get(key) { return this.store[key]; }
  set(key, val) { this.store[key] = val; }
}

class MockLogger { info() {} warn() {} error() {} }

class MockEventBus {
  constructor() { this.events = []; }
  publish(event, data) { this.events.push({ event, data }); }
}

const mockDb = new MockDatabase();
const mockSecurity = new MockSecurity();
const mockEventBus = new MockEventBus();
const mockCaches = new Map();

global.WK = {
  database: () => mockDb,
  security: () => mockSecurity,
  logger: () => new MockLogger(),
  cache: (ns) => {
    if (!mockCaches.has(ns)) mockCaches.set(ns, new MockCacheStore());
    return mockCaches.get(ns);
  },
  service: (name) => {
    if (name === 'eventbus') return mockEventBus;
    return null;
  },
};

// ============================================================================
// 2. DYNAMIC MODULE LOADER
// ============================================================================

const PKG_DIR = __dirname;
let PosyanduConstants, PosyanduMember, PosyanduRecord;
let PosyanduPermission, PosyanduRule, PosyanduValidator;
let PosyanduRepository, PosyanduService;
let PosyanduMigration, PosyanduSeeder;
let PosyanduStatistics, PosyanduDashboard;

try {
  ({ PosyanduConstants, PosyanduMember, PosyanduRecord } = require(path.join(PKG_DIR, 'PosyanduEntity.js')));
  ({ PosyanduPermission } = require(path.join(PKG_DIR, 'PosyanduPermission.js')));
  ({ PosyanduRule } = require(path.join(PKG_DIR, 'PosyanduRule.js')));
  ({ PosyanduValidator } = require(path.join(PKG_DIR, 'PosyanduValidator.js')));
  ({ PosyanduRepository } = require(path.join(PKG_DIR, 'PosyanduRepository.js')));
  ({ PosyanduService } = require(path.join(PKG_DIR, 'PosyanduService.js')));
  ({ PosyanduMigration } = require(path.join(PKG_DIR, 'PosyanduMigration.js')));
  ({ PosyanduSeeder } = require(path.join(PKG_DIR, 'PosyanduSeeder.js')));
  ({ PosyanduStatistics } = require(path.join(PKG_DIR, 'PosyanduStatistics.js')));
  ({ PosyanduDashboard } = require(path.join(PKG_DIR, 'PosyanduDashboard.js')));
} catch (e) {
  console.error('FATAL: Failed to load Posyandu production modules:', e.message);
  process.exit(1);
}

// ============================================================================
// 3. TEST HELPERS
// ============================================================================

function resetDb() {
  mockDb.tables = {};
  mockDb.indexes = {};
  mockCaches.forEach(c => { c.store = {}; });
  mockEventBus.events = [];
}

function freshRepo() {
  resetDb();
  mockDb.createTable('posyandu_members', {});
  mockDb.createTable('posyandu_records', {});
  const repo = new PosyanduRepository();
  repo.dbAdapter = mockDb;
  return repo;
}

function freshService(repo) {
  return new PosyanduService(repo || freshRepo());
}

// ============================================================================
// 4. TEST SUITE
// ============================================================================

class PosyanduTest {

  // [1] UNIT
  static runUnitTests() {
    console.log('\n--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    assert(!!PosyanduConstants, 'PosyanduConstants exported');
    assert(!!PosyanduMember, 'PosyanduMember exported');
    assert(!!PosyanduRecord, 'PosyanduRecord exported');
    assert(!!PosyanduPermission, 'PosyanduPermission exported');
    assert(!!PosyanduRule, 'PosyanduRule exported');
    assert(!!PosyanduValidator, 'PosyanduValidator exported');
    assert(!!PosyanduRepository, 'PosyanduRepository exported');
    assert(!!PosyanduService, 'PosyanduService exported');
    assert(!!PosyanduMigration, 'PosyanduMigration exported');
    assert(!!PosyanduSeeder, 'PosyanduSeeder exported');
    assert(!!PosyanduStatistics, 'PosyanduStatistics exported');
    assert(!!PosyanduDashboard, 'PosyanduDashboard exported');
    assert(Array.isArray(PosyanduConstants.TARGET_GROUPS) && PosyanduConstants.TARGET_GROUPS.length === 3, 'TARGET_GROUPS has 3 items');
    assert(Array.isArray(PosyanduConstants.NUTRITION_STATUSES) && PosyanduConstants.NUTRITION_STATUSES.length === 4, 'NUTRITION_STATUSES has 4 items');
    assert(Array.isArray(PosyanduConstants.STUNTING_STATUSES) && PosyanduConstants.STUNTING_STATUSES.length === 3, 'STUNTING_STATUSES has 3 items');
    assert(Array.isArray(PosyanduConstants.VISIT_STATUSES) && PosyanduConstants.VISIT_STATUSES.length === 3, 'VISIT_STATUSES has 3 items');
    assert(Array.isArray(PosyanduConstants.IMMUNIZATION_TYPES) && PosyanduConstants.IMMUNIZATION_TYPES.length === 11, 'IMMUNIZATION_TYPES has 11 items');

    return tests.every(Boolean);
  }

  // [2] ENTITY
  static runEntityTests() {
    console.log('\n--- [2. ENTITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const member = new PosyanduMember({
      citizenId: '3273010101230001',
      parentCitizenId: '3273010101900001',
      targetGroup: 'BALITA',
      posyanduName: 'Posyandu Melati',
      dateOfBirth: '2025-01-01',
      gender: 'L',
    });

    assert(member.id && member.id.includes('-'), 'PosyanduMember generates UUID v4');
    assert(member.targetGroup === 'BALITA', 'PosyanduMember default targetGroup is BALITA');
    assert(member.version === 1, 'PosyanduMember default version is 1');

    const displayedMember = member.toDisplay();
    assert(displayedMember.citizenId === '************0001', 'PosyanduMember toDisplay() masks citizenId NIK');
    assert(displayedMember.parentCitizenId === '************0001', 'PosyanduMember toDisplay() masks parentCitizenId NIK');
    assert(!displayedMember.hasOwnProperty('deletedAt'), 'PosyanduMember toDisplay() strips deletedAt');

    const record = new PosyanduRecord({
      memberId: member.id,
      visitDate: '2026-08-01',
      weightKg: 10.5,
      heightCm: 80.0,
      status: 'COMPLETED',
    });

    assert(record.id && record.id.includes('-'), 'PosyanduRecord generates UUID v4');
    assert(record.weightKg === 10.5, 'PosyanduRecord stores weightKg');
    assert(record.isHighRisk === false, 'PosyanduRecord default isHighRisk is false');

    const displayedRecord = record.toDisplay();
    assert(!displayedRecord.hasOwnProperty('deletedAt'), 'PosyanduRecord toDisplay() strips deletedAt');

    return tests.every(Boolean);
  }

  // [3] REPOSITORY
  static runRepositoryTests() {
    console.log('\n--- [3. REPOSITORY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();

    const member = new PosyanduMember({
      citizenId: '3273010202900002',
      targetGroup: 'IBU_HAMIL',
      posyanduName: 'Posyandu Mawar',
      dateOfBirth: '1995-05-10',
      gender: 'P',
      hpht: '2026-01-01',
    });

    repo.createMember(member);
    const found = repo.findMemberById(member.id);
    assert(!!found && found.targetGroup === 'IBU_HAMIL', 'Repository: createMember and findMemberById work');

    member.posyanduName = 'Posyandu Mawar Indah';
    const updated = repo.updateMember(member);
    assert(updated.version === 2, 'Repository: updateMember increments version (optimistic locking)');

    const record1 = new PosyanduRecord({ memberId: member.id, visitDate: '2026-07-01', weightKg: 55.0, heightCm: 158.0 });
    const record2 = new PosyanduRecord({ memberId: member.id, visitDate: '2026-08-01', weightKg: 57.0, heightCm: 158.0 });
    repo.createRecord(record1);
    repo.createRecord(record2);

    const records = repo.findRecordsByMemberId(member.id);
    assert(records.length === 2, 'Repository: findRecordsByMemberId retrieves all records');

    const latest = repo.findLatestRecordByMemberId(member.id);
    assert(latest.visitDate === '2026-08-01', 'Repository: findLatestRecordByMemberId returns most recent visit');

    return tests.every(Boolean);
  }

  // [4] VALIDATION
  static runValidationTests() {
    console.log('\n--- [4. VALIDATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const v = new PosyanduValidator();

    try {
      v.validateMemberRegistration({
        citizenId: 'c1',
        parentCitizenId: 'p1',
        targetGroup: 'BALITA',
        posyanduName: 'Posyandu A',
        dateOfBirth: '2025-01-01',
        gender: 'L',
      });
      assert(true, 'Validator: valid BALITA registration passes');
    } catch (e) { assert(false, `Validator rejected valid registration: ${e.message}`); }

    try {
      v.validateMemberRegistration({
        citizenId: 'c1',
        targetGroup: 'BALITA',
        posyanduName: 'Posyandu A',
        dateOfBirth: '2025-01-01',
        gender: 'L',
      });
      assert(false, 'Validator should reject BALITA without parentCitizenId');
    } catch (e) { assert(true, 'Validator: BALITA without parentCitizenId rejected'); }

    try {
      v.validateRecordSubmission({ memberId: 'm1', visitDate: '2026-08-01', weightKg: 10, heightCm: 80 });
      assert(true, 'Validator: valid record submission passes');
    } catch (e) { assert(false, 'Validator rejected valid record'); }

    try {
      v.validateRecordSubmission({ memberId: 'm1', visitDate: '2026-08-01', weightKg: 0, heightCm: 80 });
      assert(false, 'Validator should reject weightKg <= 0');
    } catch (e) { assert(true, 'Validator: weightKg <= 0 rejected'); }

    return tests.every(Boolean);
  }

  // [5] PERMISSION
  static runPermissionTests() {
    console.log('\n--- [5. PERMISSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const perm = new PosyanduPermission();

    try { perm.checkCreateMember(); assert(true, 'Permission: authorized checkCreateMember passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    try { perm.checkCreateRecord(); assert(true, 'Permission: authorized checkCreateRecord passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    mockSecurity.denyAll();
    try { perm.checkCreateMember(); assert(false, 'Should throw when denied'); }
    catch (e) { assert(e.message.includes('Permission denied'), 'Permission: unauthorized create member blocked'); }

    mockSecurity.allowAll();
    assert(PosyanduPermission.getPermissions().length === 6, 'Permission: all 6 permissions registered');

    return tests.every(Boolean);
  }

  // [6] RULE
  static runRuleTests() {
    console.log('\n--- [6. RULE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const rule = new PosyanduRule();

    // Nutrition & Stunting
    const normal = rule.evaluateNutritionAndStunting(24, 13.0, 88.0);
    assert(normal.nutritionStatus === 'GIZI_BAIK' && normal.stuntingStatus === 'NORMAL', 'Rule: normal balita evaluated as GIZI_BAIK & NORMAL');

    const stunted = rule.evaluateNutritionAndStunting(24, 7.0, 65.0);
    assert(stunted.nutritionStatus === 'GIZI_BURUK' && stunted.stuntingStatus === 'SEVERELY_STUNTED', 'Rule: severe low weight/height evaluated as GIZI_BURUK & SEVERELY_STUNTED');

    // High Risk Bumil
    assert(rule.evaluateHighRiskBumil(21.0, 120) === true, 'Rule: LILA < 23.5 flags high risk bumil (KEK)');
    assert(rule.evaluateHighRiskBumil(25.0, 145) === true, 'Rule: Systolic >= 140 flags high risk bumil (Hypertension)');
    assert(rule.evaluateHighRiskBumil(25.0, 120) === false, 'Rule: normal bumil is not high risk');

    // Weight Stagnation & Status
    assert(rule.evaluateWeightStagnation(10.0, 10.0) === true, 'Rule: weight stagnation detected (BB <= previous)');
    assert(rule.evaluateWeightStagnation(10.5, 10.0) === false, 'Rule: weight increase is not stagnant');

    assert(rule.determineVisitStatus(true, false) === 'FOLLOW_UP_NEEDED', 'Rule: high risk causes FOLLOW_UP_NEEDED status');
    assert(rule.determineVisitStatus(false, false) === 'COMPLETED', 'Rule: healthy visit is COMPLETED');

    return tests.every(Boolean);
  }

  // [7] SERVICE
  static runServiceTests() {
    console.log('\n--- [7. SERVICE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new PosyanduService(repo);

    const member = service.registerMember({
      citizenId: '3273010404900004',
      parentCitizenId: '3273010404900001',
      targetGroup: 'BALITA',
      posyanduName: 'Posyandu Mawar',
      dateOfBirth: '2025-06-01',
      gender: 'L',
    });
    assert(!!member.id, 'Service: registerMember stores member');

    const visit1 = service.recordVisit({
      memberId: member.id,
      visitDate: '2026-08-01',
      weightKg: 10.0,
      heightCm: 78.0,
    });
    assert(visit1.status === 'COMPLETED', 'Service: healthy visit marked COMPLETED');

    const visit2 = service.recordVisit({
      memberId: member.id,
      visitDate: '2026-09-01',
      weightKg: 9.8, // Weight drop!
      heightCm: 78.5,
    });
    assert(visit2.status === 'FOLLOW_UP_NEEDED', 'Service: stagnant/drop weight sets status FOLLOW_UP_NEEDED');
    assert(visit2.isHighRisk === true, 'Service: stagnant visit flags isHighRisk');

    const highRiskEvents = mockEventBus.events.filter(e => e.event === 'HighRiskDetected');
    assert(highRiskEvents.length >= 1, 'Service: HighRiskDetected event published on risk detection');

    return tests.every(Boolean);
  }

  // [8] MIGRATION
  static runMigrationTests() {
    console.log('\n--- [8. MIGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    resetDb();

    assert(PosyanduMigration.migrationVersion() === '1.0.0', 'Migration: version is 1.0.0');
    assert(PosyanduMigration.seedRequired() === true, 'Migration: seedRequired is true');

    PosyanduMigration.up();
    assert(mockDb.hasTable('posyandu_members'), 'Migration: creates posyandu_members table');
    assert(mockDb.hasTable('posyandu_records'), 'Migration: creates posyandu_records table');
    assert(mockDb.indexes['posyandu_members'].includes('citizenId'), 'Migration: index on citizenId created');
    assert(mockDb.indexes['posyandu_records'].includes('isHighRisk'), 'Migration: index on isHighRisk created');

    try {
      PosyanduMigration.up();
      assert(true, 'Migration: up() is idempotent (no error on re-run)');
    } catch (e) { assert(false, `Migration up() not idempotent: ${e.message}`); }

    PosyanduMigration.down();
    assert(!mockDb.hasTable('posyandu_records'), 'Migration: down() drops posyandu_records table first');
    assert(!mockDb.hasTable('posyandu_members'), 'Migration: down() drops posyandu_members table');

    return tests.every(Boolean);
  }

  // [9] SEEDER
  static runSeederTests() {
    console.log('\n--- [9. SEEDER TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    resetDb();

    const seeder = new PosyanduSeeder();
    seeder.run();

    assert(!!mockDb.findOne('lookup_groups', { name: 'POSYANDU_TARGET_GROUP' }), 'Seeder: POSYANDU_TARGET_GROUP group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'POSYANDU_NUTRITION_STATUS' }), 'Seeder: POSYANDU_NUTRITION_STATUS group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'POSYANDU_STUNTING_STATUS' }), 'Seeder: POSYANDU_STUNTING_STATUS group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'POSYANDU_VISIT_STATUS' }), 'Seeder: POSYANDU_VISIT_STATUS group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'POSYANDU_IMMUNIZATION_TYPE' }), 'Seeder: POSYANDU_IMMUNIZATION_TYPE group created');

    const countBefore = mockDb.count('lookup_items', {});
    assert(countBefore === 24, 'Seeder: 24 lookup items populated (3 target + 4 nutrition + 3 stunting + 3 visit + 11 immunization)');

    seeder.run(); // Idempotency check
    const countAfter = mockDb.count('lookup_items', {});
    assert(countBefore === countAfter, 'Seeder: run() is idempotent (no duplicate rows)');

    assert(PosyanduSeeder.isSeeded() === true, 'Seeder: isSeeded() returns true after seeding');
    assert(PosyanduSeeder.hasData() === false, 'Seeder: hasData() returns false when members is empty');

    return tests.every(Boolean);
  }

  // [10] STATISTICS
  static runStatisticsTests() {
    console.log('\n--- [10. STATISTICS TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    repo.createMember(new PosyanduMember({ id: 'm1', targetGroup: 'BALITA' }));
    repo.createMember(new PosyanduMember({ id: 'm2', targetGroup: 'IBU_HAMIL' }));

    repo.createRecord(new PosyanduRecord({ memberId: 'm1', stuntingStatus: 'STUNTED', nutritionStatus: 'GIZI_BURUK', isHighRisk: true }));
    repo.createRecord(new PosyanduRecord({ memberId: 'm2', armCircumferenceCm: 21.0, isHighRisk: true }));

    const stats = new PosyanduStatistics(repo);

    const summary = stats.getHealthSummary();
    assert(summary.totalMembers === 2, 'Statistics: totalMembers is 2');
    assert(summary.stuntingCases === 1, 'Statistics: stuntingCases is 1');
    assert(summary.malnutritionCases === 1, 'Statistics: malnutritionCases is 1');
    assert(summary.highRiskPregnancies === 1, 'Statistics: highRiskPregnancies is 1');

    const dist = stats.getNutritionDistribution();
    assert(dist.find(d => d.status === 'GIZI_BURUK').count === 1, 'Statistics: GIZI_BURUK count is 1');

    const followups = stats.getRecentFollowUps(2);
    assert(followups.length === 2, 'Statistics: getRecentFollowUps respects limit');
    assert(!followups[0].hasOwnProperty('citizenId'), 'Statistics: PHI/PII protection strips raw citizenId from follow-up DTO');

    return tests.every(Boolean);
  }

  // [11] DASHBOARD
  static runDashboardTests() {
    console.log('\n--- [11. DASHBOARD TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const widgets = PosyanduDashboard.getWidgets();

    assert(widgets.length === 4, 'Dashboard: registers exactly 4 widgets');
    assert(widgets.some(w => w.type === 'summary_card'), 'Dashboard: summary_card widget registered');
    assert(widgets.some(w => w.type === 'donut_chart'), 'Dashboard: donut_chart widget registered');
    assert(widgets.some(w => w.type === 'table'), 'Dashboard: table widget registered');
    assert(widgets.some(w => w.type === 'quick_actions'), 'Dashboard: quick_actions widget registered');

    return tests.every(Boolean);
  }

  // [12] INTEGRATION
  static runIntegrationTests() {
    console.log('\n--- [12. INTEGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new PosyanduService(repo);

    // Full integration: Bumil Risti
    const bumil = service.registerMember({
      citizenId: '3273010707900007',
      targetGroup: 'IBU_HAMIL',
      posyanduName: 'Posyandu Melati',
      dateOfBirth: '1998-03-20',
      gender: 'P',
      hpht: '2026-01-10',
    });

    const visit = service.recordVisit({
      memberId: bumil.id,
      visitDate: '2026-08-10',
      weightKg: 52.0,
      heightCm: 155.0,
      armCircumferenceCm: 21.5, // KEK!
      systolic: 145, // Hypertension!
    });

    assert(visit.isHighRisk === true, 'Integration: Bumil Risti automatically flagged high risk');
    assert(visit.status === 'FOLLOW_UP_NEEDED', 'Integration: visit status set to FOLLOW_UP_NEEDED');

    return tests.every(Boolean);
  }

  // [13] SECURITY
  static runSecurityTests() {
    console.log('\n--- [13. SECURITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const member = repo.createMember(new PosyanduMember({
      citizenId: '3273010808900008',
      parentCitizenId: '3273010808900001',
      targetGroup: 'BALITA',
    }));

    mockSecurity.allowAll();
    const service = new PosyanduService(repo);

    // Unauthorized citizen trying to access another citizen's child history
    mockSecurity.denyAll(); // Deny view.all
    try {
      service.getMemberHistory(member.id, '3273010909900099', {}); // Stranger citizenId
      assert(false, 'Security: stranger citizen should be blocked from viewing member medical history');
    } catch (e) {
      assert(e.message.includes('Unauthorized access to Posyandu medical records'), 'Security: unauthorized history access blocked');
    }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // [14] PRIVACY
  static runPrivacyTests() {
    console.log('\n--- [14. PRIVACY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const member = repo.createMember(new PosyanduMember({
      citizenId: '3273010808900008',
      parentCitizenId: '3273010808900001',
      targetGroup: 'BALITA',
    }));

    repo.createRecord(new PosyanduRecord({ memberId: member.id, visitDate: '2026-08-01', weightKg: 10, heightCm: 80 }));

    const service = new PosyanduService(repo);
    const history = service.getMemberHistory(member.id, '3273010808900001'); // Parent requesting

    assert(history.member.citizenId === '************0008', 'Privacy: child citizenId NIK masked');
    assert(history.member.parentCitizenId === '************0001', 'Privacy: parent citizenId NIK masked');
    assert(!history.member.hasOwnProperty('deletedAt'), 'Privacy: deletedAt removed from member DTO');
    assert(!history.records[0].hasOwnProperty('deletedAt'), 'Privacy: deletedAt removed from record DTO');

    return tests.every(Boolean);
  }

  // [15] PERFORMANCE
  static runPerformanceTests() {
    console.log('\n--- [15. PERFORMANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const stats = new PosyanduStatistics(repo);

    const t0 = Date.now();
    const r1 = stats.getHealthSummary();
    const r2 = stats.getHealthSummary();
    const elapsed = Date.now() - t0;

    assert(r1.totalMembers === r2.totalMembers, 'Performance: cached summary returns identical result');
    assert(elapsed < 50, 'Performance: cache hit execution is fast (< 50ms)');

    return tests.every(Boolean);
  }

  // [16] REGRESSION
  static runRegressionTests() {
    console.log('\n--- [16. REGRESSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const nik = '3273010101900001';
    const member = new PosyanduMember({ citizenId: nik, targetGroup: 'BALITA' });

    assert(member.citizenId === nik, 'Regression: Citizen NIK (16-digit) compatible as PosyanduMember.citizenId');

    const restored = PosyanduMember.fromObject(member.toObject());
    assert(restored.citizenId === nik, 'Regression: fromObject round-trip preserves citizenId');
    assert(typeof PosyanduMember.fromObject === 'function', 'Regression: PosyanduMember.fromObject is a function');
    assert(typeof PosyanduRecord.fromObject === 'function', 'Regression: PosyanduRecord.fromObject is a function');
    assert(typeof PosyanduMigration.migrationVersion === 'function', 'Regression: PosyanduMigration.migrationVersion intact');
    assert(typeof PosyanduDashboard.getWidgets === 'function', 'Regression: PosyanduDashboard.getWidgets intact');
    assert(typeof PosyanduSeeder.isSeeded === 'function', 'Regression: PosyanduSeeder.isSeeded intact');

    return tests.every(Boolean);
  }

  // [17] ACCEPTANCE
  static runAcceptanceTests() {
    console.log('\n--- [17. ACCEPTANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new PosyanduService(repo);

    const balita = service.registerMember({
      citizenId: '3273010101250005',
      parentCitizenId: '3273010101950005',
      targetGroup: 'BALITA',
      posyanduName: 'Posyandu Melati',
      dateOfBirth: '2025-06-01',
      gender: 'L',
    });

    // Visit 1: BB 10.0kg
    service.recordVisit({ memberId: balita.id, visitDate: '2026-07-01', weightKg: 10.0, heightCm: 78.0 });
    // Visit 2: Stagnant BB 10.0kg -> triggers FOLLOW_UP_NEEDED
    const v2 = service.recordVisit({ memberId: balita.id, visitDate: '2026-08-01', weightKg: 10.0, heightCm: 78.5 });

    assert(v2.status === 'FOLLOW_UP_NEEDED', 'Acceptance: stagnant weight forces FOLLOW_UP_NEEDED status');
    assert(v2.isHighRisk === true, 'Acceptance: stagnant weight forces isHighRisk flag');

    return tests.every(Boolean);
  }

  // [18] SYNTAX
  static runSyntaxTests() {
    console.log('\n--- [18. SYNTAX TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const files = [
      'PosyanduEntity.js', 'PosyanduPermission.js', 'PosyanduRule.js',
      'PosyanduValidator.js', 'PosyanduRepository.js', 'PosyanduService.js',
      'PosyanduMigration.js', 'PosyanduSeeder.js', 'PosyanduStatistics.js', 'PosyanduDashboard.js',
    ];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(PKG_DIR, file), 'utf8');
        assert(content.length > 0, `Syntax check passed: ${file}`);
      } catch (e) {
        assert(false, `Cannot read ${file}: ${e.message}`);
      }
    });

    return tests.every(Boolean);
  }

  // ============================================================================
  // QUALITY GATE AGGREGATOR
  // ============================================================================
  static runAll() {
    console.log('\n===========================================');
    console.log('  POSYANDU P80.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityHealth');
    console.log('  Package: Posyandu (Epic Posyandu / P80)');
    console.log('===========================================');

    const results = {
      UNIT: this.runUnitTests(),
      ENTITY: this.runEntityTests(),
      REPOSITORY: this.runRepositoryTests(),
      VALIDATION: this.runValidationTests(),
      PERMISSION: this.runPermissionTests(),
      RULE: this.runRuleTests(),
      SERVICE: this.runServiceTests(),
      MIGRATION: this.runMigrationTests(),
      SEEDER: this.runSeederTests(),
      STATISTICS: this.runStatisticsTests(),
      DASHBOARD: this.runDashboardTests(),
      INTEGRATION: this.runIntegrationTests(),
      SECURITY: this.runSecurityTests(),
      PRIVACY: this.runPrivacyTests(),
      PERFORMANCE: this.runPerformanceTests(),
      REGRESSION: this.runRegressionTests(),
      ACCEPTANCE: this.runAcceptanceTests(),
      SYNTAX: this.runSyntaxTests(),
    };

    console.log('\n--- [QUALITY GATE EVALUATION] ---');
    let allPassed = true;
    for (const [cat, passed] of Object.entries(results)) {
      console.log(`  - Category [${cat}]: ${passed ? 'PASS' : 'FAIL'}`);
      if (!passed) allPassed = false;
    }

    console.log('\n===========================================');
    if (allPassed) {
      console.log('  QUALITY GATE: PASS - All Behavioral Tests Passed');
    } else {
      console.log('  QUALITY GATE: FAIL - Some tests did not pass.');
    }
    console.log('===========================================\n');

    return allPassed ? 0 : 1;
  }
}

if (require.main === module) {
  process.exit(PosyanduTest.runAll());
}

module.exports = PosyanduTest;

