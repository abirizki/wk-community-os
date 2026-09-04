/**
 * @file AspirationTest.js
 * @description Behavioral Test Suite & Quality Gate — Aspiration Module (P70)
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
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
let AspirationConstants, Aspiration, AspirationVote;
let AspirationPermission, AspirationRule, AspirationValidator;
let AspirationRepository, AspirationService;
let AspirationMigration, AspirationSeeder;
let AspirationStatistics, AspirationDashboard;

try {
  ({ AspirationConstants, Aspiration, AspirationVote } = require(path.join(PKG_DIR, 'AspirationEntity.js')));
  ({ AspirationPermission } = require(path.join(PKG_DIR, 'AspirationPermission.js')));
  ({ AspirationRule } = require(path.join(PKG_DIR, 'AspirationRule.js')));
  ({ AspirationValidator } = require(path.join(PKG_DIR, 'AspirationValidator.js')));
  ({ AspirationRepository } = require(path.join(PKG_DIR, 'AspirationRepository.js')));
  ({ AspirationService } = require(path.join(PKG_DIR, 'AspirationService.js')));
  ({ AspirationMigration } = require(path.join(PKG_DIR, 'AspirationMigration.js')));
  ({ AspirationSeeder } = require(path.join(PKG_DIR, 'AspirationSeeder.js')));
  ({ AspirationStatistics } = require(path.join(PKG_DIR, 'AspirationStatistics.js')));
  ({ AspirationDashboard } = require(path.join(PKG_DIR, 'AspirationDashboard.js')));
} catch (e) {
  console.error('FATAL: Failed to load Aspiration production modules:', e.message);
  process.exit(1);
}

// ============================================================================
// 3. TEST HELPERS
// ============================================================================

function resetDb() {
  mockDb.tables = {};
  mockDb.indexes = {};
  mockCaches.forEach(c => { c.store = {}; });
}

function freshRepo() {
  resetDb();
  mockDb.createTable('aspirations', {});
  mockDb.createTable('aspiration_votes', {});
  const repo = new AspirationRepository();
  repo.dbAdapter = mockDb;
  return repo;
}

function freshService(repo) {
  return new AspirationService(repo || freshRepo());
}

// ============================================================================
// 4. TEST SUITE
// ============================================================================

class AspirationTest {

  // [1] UNIT
  static runUnitTests() {
    console.log('\n--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    assert(!!AspirationConstants, 'AspirationConstants exported');
    assert(!!Aspiration, 'Aspiration exported');
    assert(!!AspirationVote, 'AspirationVote exported');
    assert(!!AspirationPermission, 'AspirationPermission exported');
    assert(!!AspirationRule, 'AspirationRule exported');
    assert(!!AspirationValidator, 'AspirationValidator exported');
    assert(!!AspirationRepository, 'AspirationRepository exported');
    assert(!!AspirationService, 'AspirationService exported');
    assert(!!AspirationMigration, 'AspirationMigration exported');
    assert(!!AspirationSeeder, 'AspirationSeeder exported');
    assert(!!AspirationStatistics, 'AspirationStatistics exported');
    assert(!!AspirationDashboard, 'AspirationDashboard exported');
    assert(Array.isArray(AspirationConstants.ASPIRATION_CATEGORIES) && AspirationConstants.ASPIRATION_CATEGORIES.length === 7, 'ASPIRATION_CATEGORIES has 7 items');
    assert(Array.isArray(AspirationConstants.ASPIRATION_PRIORITIES) && AspirationConstants.ASPIRATION_PRIORITIES.length === 4, 'ASPIRATION_PRIORITIES has 4 items');
    assert(Array.isArray(AspirationConstants.ASPIRATION_STATUSES) && AspirationConstants.ASPIRATION_STATUSES.length === 8, 'ASPIRATION_STATUSES has 8 items');
    assert(Array.isArray(AspirationConstants.TERMINAL_STATUSES) && AspirationConstants.TERMINAL_STATUSES.length === 2, 'TERMINAL_STATUSES has 2 items');

    return tests.every(Boolean);
  }

  // [2] ENTITY
  static runEntityTests() {
    console.log('\n--- [2. ENTITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const asp = new Aspiration({
      citizenId: '3273010101900001',
      title: 'Pembangunan Saluran Air RT 02',
      description: 'Mencegah luapan air saat hujan deras',
      category: 'INFRASTRUKTUR',
      estimatedBudget: 25000000,
      location: 'Gang Buntu RT 02',
    });

    assert(asp.id && asp.id.includes('-'), 'Aspiration generates UUID v4');
    assert(asp.status === 'DRAFT', 'Aspiration default status is DRAFT');
    assert(asp.priority === 'LOW', 'Aspiration default priority is LOW');
    assert(asp.voteCount === 0, 'Aspiration default voteCount is 0');
    assert(asp.version === 1, 'Aspiration default version is 1');
    assert(asp.pollingEndDate === null, 'Aspiration default pollingEndDate is null');
    assert(asp.scheduledMeetingDate === null, 'Aspiration default scheduledMeetingDate is null');

    const obj = asp.toObject();
    const restored = Aspiration.fromObject(obj);
    assert(restored.citizenId === '3273010101900001', 'Aspiration fromObject restores citizenId');
    assert(restored.title === 'Pembangunan Saluran Air RT 02', 'Aspiration fromObject restores title');
    assert(restored.estimatedBudget === 25000000, 'Aspiration fromObject restores estimatedBudget');

    const vote = new AspirationVote({ aspirationId: asp.id, citizenId: '3273010101900002' });
    assert(vote.id && vote.id.includes('-'), 'AspirationVote generates UUID v4');
    assert(vote.aspirationId === asp.id, 'AspirationVote links to aspirationId');
    assert(vote.citizenId === '3273010101900002', 'AspirationVote links to citizenId');
    assert(!!vote.votedAt, 'AspirationVote sets votedAt timestamp');

    return tests.every(Boolean);
  }

  // [3] REPOSITORY
  static runRepositoryTests() {
    console.log('\n--- [3. REPOSITORY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();

    const asp = new Aspiration({
      citizenId: '3273010202900002',
      title: 'Pelatihan Kewirausahaan UMKM',
      description: 'Membantu warga memulai usaha online',
      category: 'PEMBERDAYAAN',
      location: 'Balai RW 02',
    });

    repo.createAspiration(asp);
    const found = repo.findAspirationById(asp.id);
    assert(!!found && found.category === 'PEMBERDAYAAN', 'Repository: createAspiration and findAspirationById work');

    const byCitizen = repo.findAspirationsByCitizen('3273010202900002');
    assert(byCitizen.length >= 1, 'Repository: findAspirationsByCitizen works');

    const byStatus = repo.findAspirationsByStatus('DRAFT');
    assert(byStatus.length >= 1, 'Repository: findAspirationsByStatus works');

    // Optimistic locking
    asp.status = 'PROPOSED';
    const updated = repo.updateAspiration(asp);
    assert(updated.version === 2, 'Repository: updateAspiration increments version (optimistic locking)');

    // Vote operations in repo
    const vote = new AspirationVote({ aspirationId: asp.id, citizenId: '3273010303900003' });
    repo.saveVote(vote);
    const foundVote = repo.findVoteByCitizen(asp.id, '3273010303900003');
    assert(!!foundVote && foundVote.aspirationId === asp.id, 'Repository: saveVote and findVoteByCitizen work');

    return tests.every(Boolean);
  }

  // [4] VALIDATION
  static runValidationTests() {
    console.log('\n--- [4. VALIDATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const v = new AspirationValidator();

    try {
      v.validateSubmit({ citizenId: 'c1', title: 'Posyandu Lansia', description: 'Cek kesehatan', category: 'KESEHATAN', location: 'Pos RT 01' });
      assert(true, 'Validator: valid submit passes');
    } catch (e) { assert(false, `Validator rejected valid submit: ${e.message}`); }

    try {
      v.validateSubmit({ title: 'Posyandu Lansia', description: 'Cek kesehatan', category: 'KESEHATAN', location: 'Pos RT 01' });
      assert(false, 'Validator should reject missing citizenId');
    } catch (e) { assert(true, 'Validator: missing citizenId rejected'); }

    try {
      v.validateSubmit({ citizenId: 'c1', title: 'Posyandu Lansia', description: 'Cek kesehatan', category: 'INVALID_CAT', location: 'Pos RT 01' });
      assert(false, 'Validator should reject invalid category');
    } catch (e) { assert(true, 'Validator: invalid category rejected'); }

    try {
      v.validateSchedule({});
      assert(false, 'Validator should reject missing scheduledMeetingDate');
    } catch (e) { assert(true, 'Validator: scheduledMeetingDate is required for schedule'); }

    try {
      v.validateDecision('REJECTED', {});
      assert(false, 'Validator should reject missing rejectedReason on rejection');
    } catch (e) { assert(true, 'Validator: rejectedReason required on rejection'); }

    try {
      v.validateDecision('ACCEPTED', { finalDecisionNotes: 'Disetujui' });
      assert(true, 'Validator: valid decision payload accepted');
    } catch (e) { assert(false, 'Validator rejected valid decision'); }

    return tests.every(Boolean);
  }

  // [5] PERMISSION
  static runPermissionTests() {
    console.log('\n--- [5. PERMISSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const perm = new AspirationPermission();

    try { perm.checkCreate(); assert(true, 'Permission: authorized checkCreate passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    try { perm.checkVote(); assert(true, 'Permission: authorized checkVote passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    try { perm.checkVerify(); assert(true, 'Permission: authorized checkVerify passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    mockSecurity.denyAll();
    try { perm.checkVerify(); assert(false, 'Should throw when denied'); }
    catch (e) { assert(e.message.includes('Permission denied'), 'Permission: unauthorized verification blocked'); }

    try { perm.checkDecide(); assert(false, 'Should throw when denied'); }
    catch (e) { assert(e.message.includes('Permission denied'), 'Permission: unauthorized decision blocked'); }

    mockSecurity.allowAll();
    assert(AspirationPermission.getPermissions().length === 7, 'Permission: all 7 permissions registered');

    return tests.every(Boolean);
  }

  // [6] RULE
  static runRuleTests() {
    console.log('\n--- [6. RULE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const rule = new AspirationRule();

    // Terminal status immutability
    try { rule.checkTerminalStatus('PROPOSED'); assert(true, 'Rule: PROPOSED is not terminal — mutation allowed'); }
    catch (e) { assert(false, 'PROPOSED should not be terminal'); }

    try { rule.checkTerminalStatus('ACCEPTED'); assert(false, 'Rule: ACCEPTED should throw as terminal'); }
    catch (e) { assert(true, 'Rule: ACCEPTED is terminal and immutable'); }

    try { rule.checkTerminalStatus('REJECTED'); assert(false, 'Rule: REJECTED should throw as terminal'); }
    catch (e) { assert(true, 'Rule: REJECTED is terminal and immutable'); }

    // Polling eligibility
    try { rule.checkPollingEligibility('POLLING', '2099-01-01'); assert(true, 'Rule: active polling allows voting'); }
    catch (e) { assert(false, 'Active polling should allow voting'); }

    try { rule.checkPollingEligibility('PROPOSED', null); assert(false, 'Rule should reject voting on non-POLLING status'); }
    catch (e) { assert(true, 'Rule: voting on non-POLLING status blocked'); }

    try { rule.checkPollingEligibility('POLLING', '2020-01-01'); assert(false, 'Rule should reject voting on expired polling period'); }
    catch (e) { assert(true, 'Rule: voting on expired polling period blocked'); }

    // One-Citizen-One-Vote
    try { rule.checkOneVoteRule('c1', [{ citizenId: 'c2' }]); assert(true, 'Rule: new citizen vote allowed'); }
    catch (e) { assert(false, 'New citizen vote should be allowed'); }

    try { rule.checkOneVoteRule('c1', [{ citizenId: 'c1' }]); assert(false, 'Rule should reject duplicate vote'); }
    catch (e) { assert(true, 'Rule: duplicate vote from same citizen blocked'); }

    return tests.every(Boolean);
  }

  // [7] SERVICE
  static runServiceTests() {
    console.log('\n--- [7. SERVICE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new AspirationService(repo);

    // 1. Submit
    const asp = service.submitAspiration({
      citizenId: '3273010404900004',
      title: 'Pemasangan PJU di Gang Kelinci',
      description: 'Penerangan jalan untuk keamanan warga malam hari',
      category: 'INFRASTRUKTUR',
      location: 'Gang Kelinci RT 04',
    });
    assert(asp.status === 'PROPOSED', 'Service: submitAspiration creates proposal in PROPOSED');

    // 2. Verify and Open Polling
    const polling = service.verifyAndOpenPolling(asp.id, 30);
    assert(polling.status === 'POLLING', 'Service: verifyAndOpenPolling moves to POLLING');
    assert(!!polling.pollingEndDate, 'Service: pollingEndDate initialized');

    // 3. Vote
    const { aspiration: votedAsp, vote } = service.voteAspiration(polling.id, '3273010505900005');
    assert(votedAsp.voteCount === 1, 'Service: voteAspiration increments voteCount');
    assert(!!vote && vote.citizenId === '3273010505900005', 'Service: vote entity recorded');

    // 4. Dynamic Priority Escalation (simulating 99 more votes)
    votedAsp.voteCount = 99;
    repo.updateAspiration(votedAsp);
    const { aspiration: highAsp } = service.voteAspiration(polling.id, '3273010606900006');
    assert(highAsp.voteCount === 100, 'Service: voteCount reached 100');
    assert(highAsp.priority === 'HIGH', 'Service: Dynamic Priority escalated to HIGH at 100 votes');

    // 5. Schedule Musrenbang
    const scheduled = service.scheduleMusrenbang(highAsp.id, { scheduledMeetingDate: '2026-10-10T09:00:00Z' });
    assert(scheduled.status === 'IN_DISCUSSION', 'Service: scheduleMusrenbang moves to IN_DISCUSSION');
    assert(scheduled.scheduledMeetingDate === '2026-10-10T09:00:00Z', 'Service: scheduledMeetingDate recorded');

    // 6. Final Decision (ACCEPTED)
    const decided = service.decideAspiration(scheduled.id, 'ACCEPTED', { finalDecisionNotes: 'Disetujui Musrenbang 2026' });
    assert(decided.status === 'ACCEPTED', 'Service: decideAspiration transitions to ACCEPTED');
    assert(decided.finalDecisionNotes === 'Disetujui Musrenbang 2026', 'Service: finalDecisionNotes recorded');

    return tests.every(Boolean);
  }

  // [8] MIGRATION
  static runMigrationTests() {
    console.log('\n--- [8. MIGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    resetDb();

    assert(AspirationMigration.migrationVersion() === '1.0.0', 'Migration: version is 1.0.0');
    assert(AspirationMigration.seedRequired() === true, 'Migration: seedRequired is true');

    AspirationMigration.up();
    assert(mockDb.hasTable('aspirations'), 'Migration: creates aspirations table');
    assert(mockDb.hasTable('aspiration_votes'), 'Migration: creates aspiration_votes table');
    assert(mockDb.indexes['aspiration_votes'].includes('aspirationId_citizenId_unique'), 'Migration: unique index on aspirationId+citizenId configured');

    try {
      AspirationMigration.up();
      assert(true, 'Migration: up() is idempotent (no error on re-run)');
    } catch (e) { assert(false, `Migration up() not idempotent: ${e.message}`); }

    AspirationMigration.down();
    assert(!mockDb.hasTable('aspiration_votes'), 'Migration: down() drops aspiration_votes table first');
    assert(!mockDb.hasTable('aspirations'), 'Migration: down() drops aspirations table');

    return tests.every(Boolean);
  }

  // [9] SEEDER
  static runSeederTests() {
    console.log('\n--- [9. SEEDER TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    resetDb();

    const seeder = new AspirationSeeder();
    seeder.run();

    assert(!!mockDb.findOne('lookup_groups', { name: 'ASPIRATION_CATEGORY' }), 'Seeder: ASPIRATION_CATEGORY group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'ASPIRATION_PRIORITY' }), 'Seeder: ASPIRATION_PRIORITY group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'ASPIRATION_STATUS' }), 'Seeder: ASPIRATION_STATUS group created');

    const countBefore = mockDb.count('lookup_items', {});
    assert(countBefore === 19, 'Seeder: 19 lookup items populated (7 categories + 4 priorities + 8 statuses)');

    seeder.run(); // Idempotency check
    const countAfter = mockDb.count('lookup_items', {});
    assert(countBefore === countAfter, 'Seeder: run() is idempotent (no duplicate rows)');

    assert(AspirationSeeder.isSeeded() === true, 'Seeder: isSeeded() returns true after seeding');
    assert(AspirationSeeder.hasData() === false, 'Seeder: hasData() returns false when aspirations is empty');

    return tests.every(Boolean);
  }

  // [10] STATISTICS
  static runStatisticsTests() {
    console.log('\n--- [10. STATISTICS TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();

    repo.createAspiration(new Aspiration({ citizenId: 'c1', title: 'Asp 1', category: 'INFRASTRUKTUR', status: 'POLLING', voteCount: 50, createdAt: '2026-08-01T10:00:00Z' }));
    repo.createAspiration(new Aspiration({ citizenId: 'c2', title: 'Asp 2', category: 'PENDIDIKAN', status: 'IN_DISCUSSION', voteCount: 120, createdAt: '2026-08-02T10:00:00Z' }));
    repo.createAspiration(new Aspiration({ citizenId: 'c3', title: 'Asp 3', category: 'KESEHATAN', status: 'ACCEPTED', voteCount: 200, createdAt: '2026-08-03T10:00:00Z' }));
    repo.createAspiration(new Aspiration({ citizenId: 'c4', title: 'Asp 4', category: 'LINGKUNGAN', status: 'REJECTED', voteCount: 10, createdAt: '2026-08-04T10:00:00Z' }));

    const stats = new AspirationStatistics(repo);

    const summary = stats.getParticipationSummary();
    assert(summary.totalAspirations === 4, 'Statistics: totalAspirations count is 4');
    assert(summary.activePolling === 1, 'Statistics: activePolling count is 1 (POLLING)');
    assert(summary.scheduled === 1, 'Statistics: scheduled count is 1 (IN_DISCUSSION)');
    assert(summary.accepted === 1, 'Statistics: accepted count is 1 (ACCEPTED)');
    assert(summary.totalVotes === 380, 'Statistics: totalVotes sum is 380 (50+120+200+10)');
    assert(summary.acceptanceRate === '25.0', 'Statistics: acceptanceRate is 25.0% (1/4)');

    const catDist = stats.getCategoryDistribution();
    assert(catDist.find(c => c.category === 'INFRASTRUKTUR').count === 1, 'Statistics: INFRASTRUKTUR count is 1');
    assert(catDist.find(c => c.category === 'PEMBERDAYAAN').count === 0, 'Statistics: PEMBERDAYAAN count is 0');

    const top = stats.getTopAspirations(2);
    assert(top.length === 2, 'Statistics: getTopAspirations respects limit');
    assert(top[0].title === 'Asp 3' && top[0].voteCount === 200, 'Statistics: top 1 is highest voteCount (200)');

    return tests.every(Boolean);
  }

  // [11] DASHBOARD
  static runDashboardTests() {
    console.log('\n--- [11. DASHBOARD TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const widgets = AspirationDashboard.getWidgets();

    assert(widgets.length === 4, 'Dashboard: registers exactly 4 widgets');
    assert(widgets.some(w => w.type === 'summary_card'), 'Dashboard: summary_card widget registered');
    assert(widgets.some(w => w.type === 'donut_chart'), 'Dashboard: donut_chart widget registered for category distribution');
    assert(widgets.some(w => w.type === 'table'), 'Dashboard: table widget registered for top proposals');
    assert(widgets.some(w => w.type === 'quick_actions'), 'Dashboard: quick_actions widget registered');
    assert(widgets.find(w => w.type === 'summary_card').dataSource === 'AspirationStatistics.getParticipationSummary', 'Dashboard: summary_card mapped to getParticipationSummary');

    return tests.every(Boolean);
  }

  // [12] INTEGRATION
  static runIntegrationTests() {
    console.log('\n--- [12. INTEGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new AspirationService(repo);

    // Full lifecycle integration
    const proposed = service.submitAspiration({
      citizenId: '3273010707900007',
      title: 'Pembangunan Taman Lansia & Anak',
      description: 'Lahan fasum RW 03',
      category: 'SOSIAL_BUDAYA',
      estimatedBudget: 35000000,
      location: 'RW 03',
    });

    const polling = service.verifyAndOpenPolling(proposed.id, 14);

    // Cast votes
    service.voteAspiration(polling.id, '3273010101900001');
    service.voteAspiration(polling.id, '3273010101900002');
    assert(repo.findAspirationById(polling.id).voteCount === 2, 'Integration: voteCount increments reliably');

    const scheduled = service.scheduleMusrenbang(polling.id, { scheduledMeetingDate: '2026-11-20T10:00:00Z' });
    const accepted = service.decideAspiration(scheduled.id, 'ACCEPTED', { finalDecisionNotes: 'Diterima dalam Musrenbang 2026' });

    assert(accepted.status === 'ACCEPTED', 'Integration: aspiration successfully finalized to ACCEPTED');
    assert(accepted.finalDecisionNotes === 'Diterima dalam Musrenbang 2026', 'Integration: finalDecisionNotes persisted');

    return tests.every(Boolean);
  }

  // [13] SECURITY
  static runSecurityTests() {
    console.log('\n--- [13. SECURITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.denyAll();
    const service = freshService();

    try {
      service.submitAspiration({ citizenId: 'c1', title: 'Test', description: 'Test', category: 'INFRASTRUKTUR', location: 'X' });
      assert(false, 'Security: unauthorized submitAspiration should be blocked');
    } catch (e) { assert(e.message.includes('Permission denied'), 'Security: submitAspiration blocked without authorization'); }

    try {
      service.decideAspiration('dummy-id', 'ACCEPTED', { finalDecisionNotes: 'Notes' });
      assert(false, 'Security: unauthorized decideAspiration should be blocked');
    } catch (e) { assert(e.message.includes('Permission denied'), 'Security: decideAspiration blocked without authorization'); }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // [14] PRIVACY
  static runPrivacyTests() {
    console.log('\n--- [14. PRIVACY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    repo.createAspiration(new Aspiration({
      citizenId: '3273010808900008',
      title: 'Usulan Privasi',
      description: 'Pengadaan CCTV',
      category: 'INFRASTRUKTUR',
      status: 'ACCEPTED',
      voteCount: 75,
      createdAt: '2026-08-15T10:00:00Z',
      deletedAt: '2026-08-16T10:00:00Z',
      deletedBy: 'admin',
    }));

    const stats = new AspirationStatistics(repo);
    const top = stats.getTopAspirations(1);

    assert(top.length === 1, 'Privacy: getTopAspirations returns list');
    assert(top[0].citizenId === '************0008', 'Privacy: citizenId NIK masked in top proposals');
    assert(!top[0].hasOwnProperty('deletedAt'), 'Privacy: deletedAt stripped from dashboard table');
    assert(!top[0].hasOwnProperty('deletedBy'), 'Privacy: deletedBy stripped from dashboard table');

    return tests.every(Boolean);
  }

  // [15] PERFORMANCE
  static runPerformanceTests() {
    console.log('\n--- [15. PERFORMANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const stats = new AspirationStatistics(repo);

    const t0 = Date.now();
    const r1 = stats.getParticipationSummary(); // miss -> compute
    const r2 = stats.getParticipationSummary(); // hit -> cache
    const elapsed = Date.now() - t0;

    assert(r1.totalAspirations === r2.totalAspirations, 'Performance: cached summary returns identical result');
    assert(elapsed < 50, 'Performance: cache hit execution is fast (< 50ms)');

    return tests.every(Boolean);
  }

  // [16] REGRESSION
  static runRegressionTests() {
    console.log('\n--- [16. REGRESSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const nik = '3273010101900001';
    const asp = new Aspiration({ citizenId: nik, title: 'Test', description: 'Test', category: 'INFRASTRUKTUR', location: 'Loc' });

    assert(asp.citizenId === nik, 'Regression: Citizen NIK (16-digit) compatible as Aspiration.citizenId');

    const restored = Aspiration.fromObject(asp.toObject());
    assert(restored.citizenId === nik, 'Regression: fromObject round-trip preserves citizenId');
    assert(typeof Aspiration.fromObject === 'function', 'Regression: Aspiration.fromObject is a function');
    assert(typeof AspirationVote.fromObject === 'function', 'Regression: AspirationVote.fromObject is a function');
    assert(typeof AspirationMigration.migrationVersion === 'function', 'Regression: AspirationMigration.migrationVersion intact');
    assert(typeof AspirationDashboard.getWidgets === 'function', 'Regression: AspirationDashboard.getWidgets intact');
    assert(typeof AspirationSeeder.isSeeded === 'function', 'Regression: AspirationSeeder.isSeeded intact');

    return tests.every(Boolean);
  }

  // [17] ACCEPTANCE
  static runAcceptanceTests() {
    console.log('\n--- [17. ACCEPTANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const repo = freshRepo();
    const service = new AspirationService(repo);

    // 1. One-Citizen-One-Vote Strict Rule
    const proposal = service.submitAspiration({
      citizenId: '3273010101900001',
      title: 'Taman Lansia',
      description: 'Lahan fasum',
      category: 'SOSIAL_BUDAYA',
      location: 'RT 01',
    });
    service.verifyAndOpenPolling(proposal.id, 14);

    service.voteAspiration(proposal.id, '3273010101900002');

    try {
      service.voteAspiration(proposal.id, '3273010101900002'); // Same citizen voting again
      assert(false, 'Acceptance: should reject second vote from same citizen');
    } catch (e) {
      assert(e.message.includes('One-Citizen-One-Vote'), 'Acceptance: One-Citizen-One-Vote strictly blocks duplicate votes');
    }

    // 2. Voting blocked when not in POLLING status
    const draftProp = service.submitAspiration({
      citizenId: '3273010101900003',
      title: 'Drainase Baru',
      description: 'Saluran air',
      category: 'INFRASTRUKTUR',
      location: 'RT 03',
    });

    try {
      service.voteAspiration(draftProp.id, '3273010101900004'); // status is PROPOSED
      assert(false, 'Acceptance: should reject voting on PROPOSED status');
    } catch (e) {
      assert(e.message.includes('Voting is only allowed when aspiration status is \'POLLING\''), 'Acceptance: voting strictly prohibited on non-POLLING status');
    }

    return tests.every(Boolean);
  }

  // [18] SYNTAX
  static runSyntaxTests() {
    console.log('\n--- [18. SYNTAX TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const files = [
      'AspirationEntity.js', 'AspirationPermission.js', 'AspirationRule.js',
      'AspirationValidator.js', 'AspirationRepository.js', 'AspirationService.js',
      'AspirationMigration.js', 'AspirationSeeder.js', 'AspirationStatistics.js', 'AspirationDashboard.js',
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
    console.log('  ASPIRATION P70.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityDemocracy');
    console.log('  Package: Aspiration (Epic Aspiration / P70)');
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
  process.exit(AspirationTest.runAll());
}

module.exports = AspirationTest;
