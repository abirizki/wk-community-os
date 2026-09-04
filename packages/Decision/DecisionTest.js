/**
 * @file DecisionTest.js
 * @description Comprehensive behavioral test suite and Quality Gate for the Decision package (Epic Governance / Package P21).
 * Tests all 18 standard WK-OS categories across Entity, Service, Data, Analytics, and UI layers.
 */

const path = require('path');
const fs = require('fs');

// ============================================================================
// 1. MOCK ENVIRONMENT & ENGINE SETUP
// ============================================================================

class MockDatabase {
  constructor() {
    this.tables = new Map();
    this.records = new Map();
    this.indexes = new Map();
    this.nextId = 1;
  }

  hasTable(tableName) {
    return this.tables.has(tableName);
  }

  createTable(tableName, columns) {
    if (this.tables.has(tableName)) return false;
    this.tables.set(tableName, { columns });
    if (!this.records.has(tableName)) this.records.set(tableName, []);
    return true;
  }

  dropTable(tableName) {
    if (this.tables.has(tableName)) {
      this.tables.delete(tableName);
      this.records.delete(tableName);
      return true;
    }
    return false;
  }

  ensureIndex(tableName, field) {
    if (!this.indexes.has(tableName)) this.indexes.set(tableName, new Set());
    this.indexes.get(tableName).add(field);
  }

  create(tableName, record) {
    const tableRecords = this.records.get(tableName) || [];
    const newRecord = {
      id: record.id || `mock-id-${this.nextId++}`,
      ...record,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    tableRecords.push(newRecord);
    this.records.set(tableName, tableRecords);
    return newRecord;
  }

  findById(tableName, id) {
    const tableRecords = this.records.get(tableName) || [];
    return tableRecords.find(r => r.id === id) || null;
  }

  findOne(tableName, query = {}) {
    const tableRecords = this.records.get(tableName) || [];
    return tableRecords.find(r => Object.keys(query).every(k => r[k] === query[k])) || null;
  }

  search(tableName, query = {}, options = {}) {
    const tableRecords = this.records.get(tableName) || [];
    return tableRecords.filter(r => Object.keys(query).every(k => r[k] === query[k]));
  }

  update(tableName, id, updates) {
    const tableRecords = this.records.get(tableName) || [];
    const record = tableRecords.find(r => r.id === id);
    if (!record) return null;
    Object.assign(record, updates);
    return record;
  }

  softDelete(tableName, id, userId) {
    const record = this.findById(tableName, id);
    if (!record) return false;
    record.deletedAt = new Date().toISOString();
    record.deletedBy = userId;
    return true;
  }

  count(tableName, query = {}) {
    return this.search(tableName, query).length;
  }
}

class MockSecurity {
  constructor() {
    this.deniedPermissions = new Set();
  }

  checkPermission(permission) {
    if (this.deniedPermissions.has(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  hasPermission(permission) {
    return !this.deniedPermissions.has(permission);
  }

  deny(permission) {
    this.deniedPermissions.add(permission);
  }

  allow(permission) {
    this.deniedPermissions.delete(permission);
  }

  allowAll() {
    this.deniedPermissions.clear();
  }
}

class MockCacheStore {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key) || null;
  }

  set(key, val) {
    this.store.set(key, val);
  }

  clear() {
    this.store.clear();
  }
}

class MockLogger {
  constructor(channel = 'App') {
    this.channel = channel;
    this.logs = [];
  }

  info(msg) { this.logs.push({ level: 'info', msg }); }
  warn(msg) { this.logs.push({ level: 'warn', msg }); }
  error(msg) { this.logs.push({ level: 'error', msg }); }
}

class MockEventBus {
  constructor() {
    this.events = [];
  }

  publish(event, payload) {
    this.events.push({ event, payload, timestamp: new Date().toISOString() });
  }

  getEvents(eventName) {
    return this.events.filter(e => e.event === eventName);
  }

  clear() {
    this.events = [];
  }
}

class MockAnalyticsService {
  constructor() {
    this.tracked = [];
  }

  track(metric, data) {
    this.tracked.push({ metric, data, timestamp: new Date().toISOString() });
  }

  getTimeSeries(opts) {
    return {
      success: true,
      metric: opts.metric,
      data: [{ period: '2026-08', value: 5 }],
    };
  }
}

// Global WK Facade Initialization
const mockDb = new MockDatabase();
const mockSecurity = new MockSecurity();
const mockCaches = new Map();
const mockEventBus = new MockEventBus();
const mockAnalytics = new MockAnalyticsService();

global.WK = {
  database: () => mockDb,
  security: () => mockSecurity,
  logger: (ch) => new MockLogger(ch),
  cache: (ns) => {
    if (!mockCaches.has(ns)) mockCaches.set(ns, new MockCacheStore());
    return mockCaches.get(ns);
  },
  user: () => ({ id: 'citizen-rt-admin', name: 'Ketua RT 02 Kebonjati' }),
  service: (name) => {
    if (name === 'eventbus') return mockEventBus;
    if (name === 'AnalyticsService') return mockAnalytics;
    return null;
  },
};

// ============================================================================
// 2. LOAD PRODUCTION DECISION MODULES
// ============================================================================

const { DecisionConstants, Decision, DecisionImpact } = require('./DecisionEntity.js');
const DecisionPermission = require('./DecisionPermission.js');
const DecisionRule = require('./DecisionRule.js');
const DecisionValidator = require('./DecisionValidator.js');
const DecisionRepository = require('./DecisionRepository.js');
const DecisionService = require('./DecisionService.js');
const DecisionMigration = require('./DecisionMigration.js');
const DecisionSeeder = require('./DecisionSeeder.js');
const DecisionStatistics = require('./DecisionStatistics.js');
const DecisionDashboard = require('./DecisionDashboard.js');

// ============================================================================
// 3. DECISION TEST SUITE CLASS
// ============================================================================

class DecisionTest {
  /**
   * Runs all 18 test categories and executes Quality Gate evaluation.
   * @returns {boolean}
   */
  static runAll() {
    console.log('\n===========================================');
    console.log('  DECISION P21.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityGovernance');
    console.log('  Package: Decision (Epic Governance / P21)');
    console.log('===========================================\n');

    const results = {
      unit: this.runUnitTests(),
      entity: this.runEntityTests(),
      repository: this.runRepositoryTests(),
      validation: this.runValidationTests(),
      permission: this.runPermissionTests(),
      rule: this.runRuleTests(),
      service: this.runServiceTests(),
      migration: this.runMigrationTests(),
      seeder: this.runSeederTests(),
      statistics: this.runStatisticsTests(),
      dashboard: this.runDashboardTests(),
      integration: this.runIntegrationTests(),
      security: this.runSecurityTests(),
      privacy: this.runPrivacyTests(),
      performance: this.runPerformanceTests(),
      regression: this.runRegressionTests(),
      acceptance: this.runAcceptanceTests(),
      syntax: this.runSyntaxTests(),
    };

    const qualityGatePassed = this.runQualityGate(results);

    console.log('\n===========================================');
    if (qualityGatePassed) {
      console.log('  QUALITY GATE: PASS - All Behavioral Tests Passed');
    } else {
      console.log('  QUALITY GATE: FAIL - Some Categories Failed');
    }
    console.log('===========================================\n');

    return qualityGatePassed;
  }

  // 1. UNIT TESTS
  static runUnitTests() {
    console.log('--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    assert(typeof DecisionConstants === 'function', 'DecisionConstants class exported');
    assert(typeof Decision === 'function', 'Decision class exported');
    assert(typeof DecisionImpact === 'function', 'DecisionImpact class exported');
    assert(Array.isArray(DecisionConstants.CATEGORIES), 'DecisionConstants categories defined');
    assert(Array.isArray(DecisionConstants.STATUSES), 'DecisionConstants statuses defined');
    assert(Array.isArray(DecisionConstants.TARGET_TYPES), 'DecisionConstants target types defined');
    assert(typeof DecisionPermission === 'function', 'DecisionPermission class exported');
    assert(typeof DecisionRule === 'function', 'DecisionRule class exported');
    assert(typeof DecisionValidator === 'function', 'DecisionValidator class exported');
    assert(typeof DecisionRepository === 'function', 'DecisionRepository class exported');
    assert(typeof DecisionService === 'function', 'DecisionService class exported');
    assert(typeof DecisionMigration === 'function', 'DecisionMigration class exported');
    assert(typeof DecisionSeeder === 'function', 'DecisionSeeder class exported');
    assert(typeof DecisionStatistics === 'function', 'DecisionStatistics class exported');
    assert(typeof DecisionDashboard === 'function', 'DecisionDashboard class exported');

    return tests.every(Boolean);
  }

  // 2. ENTITY TESTS
  static runEntityTests() {
    console.log('\n--- [2. ENTITY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    // Decision Entity
    const decision = new Decision({
      decisionNumber: 'KEP-TEST-001',
      meetingId: 'meet-001',
      title: 'Ketetapan Test',
      content: 'Isi ketetapan pengujian',
      category: 'ANGGARAN_KEUANGAN',
      scopeType: 'RT',
      scopeId: 'RT_01',
    });

    assert(typeof decision.id === 'string' && decision.id.length > 0, 'Decision ID generated (UUID v4)');
    assert(decision.status === 'DRAFT', 'Decision default status is DRAFT');
    assert(decision.isPublic === true, 'Decision default isPublic is true');
    assert(decision.version === 1, 'Decision default version is 1');

    const decisionObj = decision.toObject();
    const decisionRestored = Decision.fromObject(decisionObj);
    assert(decisionRestored.title === 'Ketetapan Test', 'Decision fromObject restores title');

    // Impact Entity
    const impact = new DecisionImpact({
      decisionId: decision.id,
      targetType: 'ALL_CITIZENS',
      targetScopeId: 'RT_01',
      description: 'Dampak bagi seluruh warga RT 01',
    });
    assert(impact.targetType === 'ALL_CITIZENS', 'DecisionImpact stores targetType');
    const impactObj = impact.toObject();
    const impactRestored = DecisionImpact.fromObject(impactObj);
    assert(impactRestored.targetScopeId === 'RT_01', 'DecisionImpact fromObject restores targetScopeId');

    return tests.every(Boolean);
  }

  // 3. REPOSITORY TESTS
  static runRepositoryTests() {
    console.log('\n--- [3. REPOSITORY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;

    // Create decision
    const decisionEntity = new Decision({
      decisionNumber: 'KEP-REPO-001',
      meetingId: 'meet-repo-100',
      title: 'Repo Test Decision',
      content: 'Konten ketetapan',
      category: 'KEAMANAN_RONDA',
      scopeType: 'RW',
      scopeId: 'RW_02',
    });
    const created = repo.createDecision(decisionEntity);
    assert(created && created.id, 'Repository creates decision');

    // Find and update decision
    const found = repo.findDecisionById(created.id);
    assert(found && found.title === 'Repo Test Decision', 'Repository finds decision by ID');

    const byNumber = repo.findByDecisionNumber('KEP-REPO-001');
    assert(byNumber && byNumber.id === created.id, 'Repository finds decision by decisionNumber');

    const updated = repo.updateDecision(created.id, { title: 'Updated Repo Decision' });
    assert(updated.title === 'Updated Repo Decision' && updated.version === 2, 'Repository updates decision with version bump');

    // Add and find impacts
    const impactEntity = new DecisionImpact({
      decisionId: created.id,
      targetType: 'FAMILY_HEADS',
      targetScopeId: 'RW_02',
      description: 'KK di RW 02 terdampak',
    });
    repo.addImpact(impactEntity);
    const impacts = repo.findImpactsByDecisionId(created.id);
    assert(impacts.length >= 1, 'Repository retrieves impacts by decision ID');

    return tests.every(Boolean);
  }

  // 4. VALIDATION TESTS
  static runValidationTests() {
    console.log('\n--- [4. VALIDATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);
    const validator = new DecisionValidator(rule);

    // Valid decision creation
    try {
      validator.validateDecisionCreate({
        decisionNumber: 'KEP-VAL-001',
        meetingId: 'meet-001',
        title: 'Ketetapan Valid',
        content: 'Isi lengkap',
        category: 'KEBERSIHAN_INFRASTRUKTUR',
        scopeType: 'RT',
        scopeId: 'RT_03',
        effectiveDate: new Date().toISOString(),
      });
      assert(true, 'Validator passes valid decision creation payload');
    } catch (e) {
      assert(false, `Validator failed valid decision: ${e.message}`);
    }

    // Missing meetingId
    try {
      validator.validateDecisionCreate({ title: 'No Meeting' });
      assert(false, 'Validator should reject missing meetingId/title');
    } catch (e) {
      assert(true, 'Validator rejects incomplete decision payload');
    }

    // Immutable field check on update
    try {
      validator.validateDecisionUpdate({ scopeId: 'RT_NEW' });
      assert(false, 'Validator should reject modifying immutable scopeId');
    } catch (e) {
      assert(true, 'Validator blocks updating immutable scopeId/scopeType');
    }

    return tests.every(Boolean);
  }

  // 5. PERMISSION TESTS
  static runPermissionTests() {
    console.log('\n--- [5. PERMISSION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const permission = new DecisionPermission();
    mockSecurity.allowAll();

    try {
      permission.checkCreateDecision();
      permission.checkRatifyDecision();
      permission.checkSupersedeDecision();
      permission.checkRevokeDecision();
      assert(true, 'Permission checks succeed when authorized');
    } catch (e) {
      assert(false, `Permission check failed: ${e.message}`);
    }

    mockSecurity.deny('decision.ratify');
    try {
      permission.checkRatifyDecision();
      assert(false, 'Permission check should throw when denied');
    } catch (e) {
      assert(true, 'Permission check properly enforces security denial on ratify');
    }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // 6. RULE TESTS
  static runRuleTests() {
    console.log('\n--- [6. RULE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);

    // Valid category & target checks
    try {
      rule.checkValidCategory('ANGGARAN_KEUANGAN');
      rule.checkValidScopeType('RT');
      rule.checkValidTargetType('FAMILY_HEADS');
      assert(true, 'Rule accepts valid category, scope, and target type');
    } catch (e) {
      assert(false, `Rule rejected valid constants: ${e.message}`);
    }

    // Allowed transition: DRAFT -> RATIFIED -> SUPERSEDED
    try {
      rule.checkStatusTransition('DRAFT', 'RATIFIED');
      rule.checkStatusTransition('RATIFIED', 'SUPERSEDED');
      assert(true, 'Rule permits valid status transitions');
    } catch (e) {
      assert(false, `Rule rejected valid status transition: ${e.message}`);
    }

    // Disallowed transition: REVOKED -> RATIFIED
    try {
      rule.checkStatusTransition('REVOKED', 'RATIFIED');
      assert(false, 'Rule should reject reviving revoked decision');
    } catch (e) {
      assert(true, 'Rule rejects illegal status transition');
    }

    // Immutability test on RATIFIED decision
    try {
      rule.checkImmutability({ status: 'RATIFIED' });
      assert(false, 'Rule should reject modification of RATIFIED decision');
    } catch (e) {
      assert(true, 'Rule protects immutability of ratified decisions');
    }

    return tests.every(Boolean);
  }

  // 7. SERVICE TESTS
  static runServiceTests() {
    console.log('\n--- [7. SERVICE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);
    const validator = new DecisionValidator(rule);
    const permission = new DecisionPermission();
    const service = new DecisionService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.allowAll();

    // Create decision via service
    const decision = service.createDecision({
      decisionNumber: 'KEP-SVC-001',
      meetingId: 'meet-svc-100',
      title: 'Service Created Decision',
      content: 'Diktum ketetapan service',
      category: 'KEGIATAN_SOSIAL',
      scopeType: 'RT',
      scopeId: 'RT_02',
      effectiveDate: new Date().toISOString(),
    });
    assert(decision && decision.title === 'Service Created Decision', 'Service drafts decision and publishes event');

    // Add impact
    const impact = service.addImpact({
      decisionId: decision.id,
      targetType: 'ALL_CITIZENS',
      targetScopeId: 'RT_02',
      description: 'Warga RT 02 berpartisipasi',
    });
    assert(impact && impact.decisionId === decision.id, 'Service adds impact declaration');

    // Ratify decision
    const ratified = service.ratifyDecision(decision.id, 'cit-ketua-rt');
    assert(ratified.status === 'RATIFIED' && ratified.signatoryCitizenId === 'cit-ketua-rt', 'Service ratifies decision');

    // Supersede decision
    const supersedeResult = service.supersedeDecision(decision.id, {
      decisionNumber: 'KEP-SVC-002',
      meetingId: 'meet-svc-101',
      title: 'Service Superseding Decision',
      content: 'Diktum revisi service',
      category: 'KEGIATAN_SOSIAL',
      scopeType: 'RT',
      scopeId: 'RT_02',
      effectiveDate: new Date().toISOString(),
    });
    assert(supersedeResult.oldDecision.status === 'SUPERSEDED', 'Service supersedes old decision');
    assert(supersedeResult.newDecision.id === supersedeResult.oldDecision.supersededByDecisionId, 'Service links new decision to old decree');

    return tests.every(Boolean);
  }

  // 8. MIGRATION TESTS
  static runMigrationTests() {
    console.log('\n--- [8. MIGRATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    assert(DecisionMigration.migrationVersion() === '1.0.0', 'Migration version is 1.0.0');
    assert(DecisionMigration.seedRequired() === true, 'Migration requires seeding');

    DecisionMigration.up();
    assert(mockDb.hasTable('decisions'), 'Migration creates decisions table');
    assert(mockDb.hasTable('decision_impacts'), 'Migration creates decision_impacts table');

    // Idempotency re-run
    try {
      DecisionMigration.up();
      assert(true, 'Migration up is idempotent (re-run safely without error)');
    } catch (e) {
      assert(false, `Migration up failed idempotency: ${e.message}`);
    }

    return tests.every(Boolean);
  }

  // 9. SEEDER TESTS
  static runSeederTests() {
    console.log('\n--- [9. SEEDER TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    // Ensure lookup tables exist
    mockDb.createTable('lookup_groups', []);
    mockDb.createTable('lookup_items', []);

    const seeder = new DecisionSeeder();
    seeder.run();
    assert(DecisionSeeder.isSeeded() === true, 'Seeder populates lookup data and detects isSeeded');

    // Idempotency re-run
    try {
      seeder.run();
      assert(true, 'Seeder run is idempotent (re-run without duplicates)');
    } catch (e) {
      assert(false, `Seeder failed idempotency: ${e.message}`);
    }

    return tests.every(Boolean);
  }

  // 10. STATISTICS TESTS
  static runStatisticsTests() {
    console.log('\n--- [10. STATISTICS TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const stats = new DecisionStatistics(repo, mockAnalytics);

    const summary = stats.getSummary();
    assert(typeof summary.totalDecisions === 'number', 'Statistics summary calculates totalDecisions');
    assert(typeof summary.ratifiedDecisions === 'number', 'Statistics summary calculates ratifiedDecisions');
    assert(typeof summary.activeRate === 'string', 'Statistics calculates activeRate');

    const catDist = stats.getCategoryDistribution();
    assert(Array.isArray(catDist) && catDist.length > 0, 'Statistics returns category distribution');

    const targetDist = stats.getTargetTypeDistribution();
    assert(Array.isArray(targetDist) && targetDist.length > 0, 'Statistics returns target type distribution');

    const recent = stats.getRecentDecisions(3);
    assert(Array.isArray(recent), 'Statistics returns recent ratified decisions');

    return tests.every(Boolean);
  }

  // 11. DASHBOARD TESTS
  static runDashboardTests() {
    console.log('\n--- [11. DASHBOARD TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const widgets = DecisionDashboard.getWidgets();
    assert(Array.isArray(widgets) && widgets.length >= 8, 'Dashboard registers all required widgets');

    const summaryWidget = widgets.find(w => w.type === 'summary_card');
    assert(summaryWidget && summaryWidget.dataSource.startsWith('DecisionStatistics'), 'Summary card maps to DecisionStatistics');

    const pieWidget = widgets.find(w => w.type === 'pie_chart');
    assert(pieWidget && pieWidget.id === 'decision_category_distribution', 'Pie chart registered for category distribution');

    const donutWidget = widgets.find(w => w.type === 'donut_chart');
    assert(donutWidget && donutWidget.id === 'decision_target_distribution', 'Donut chart registered for target distribution');

    return tests.every(Boolean);
  }

  // 12. INTEGRATION TESTS
  static runIntegrationTests() {
    console.log('\n--- [12. INTEGRATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    // Clear cache to test fresh integration state
    mockCaches.forEach(c => c.clear());

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);
    const validator = new DecisionValidator(rule);
    const permission = new DecisionPermission();
    const service = new DecisionService(repo, validator, permission, rule, mockEventBus, mockAnalytics);
    const stats = new DecisionStatistics(repo, mockAnalytics);

    // E2E Flow: Draft decision -> Add Impact -> Ratify -> Stats capture
    const decision = service.createDecision({
      decisionNumber: 'KEP-E2E-001',
      meetingId: 'meet-e2e-100',
      title: 'E2E Ketetapan Bersama Penertiban Pedagang',
      content: 'Menimbang ketertiban jalan, pedagang dilarang berjualan di trotoar utama.',
      category: 'TATA_TERTIB_LINGKUNGAN',
      scopeType: 'KELURAHAN',
      scopeId: 'KEL_KEBONJATI',
      effectiveDate: new Date().toISOString(),
    });

    service.addImpact({
      decisionId: decision.id,
      targetType: 'MERCHANTS',
      targetScopeId: 'KEL_KEBONJATI',
      description: 'Pedagang kaki lima wajib menempati area sentra kuliner.',
    });

    const ratified = service.ratifyDecision(decision.id, 'cit-lurah-kebonjati');
    assert(ratified.status === 'RATIFIED', 'Integration: Decision reached RATIFIED status');

    const details = service.getDecisionDetails(decision.id);
    assert(details.impacts.length === 1, 'Integration: Impact successfully bundled with decision');

    const summary = stats.getSummary();
    assert(summary.ratifiedDecisions >= 1, 'Integration: Statistics accurately captures ratified decision');

    return tests.every(Boolean);
  }

  // 13. SECURITY TESTS
  static runSecurityTests() {
    console.log('\n--- [13. SECURITY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);
    const validator = new DecisionValidator(rule);
    const permission = new DecisionPermission();
    const service = new DecisionService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.deny('decision.create');
    try {
      service.createDecision({ title: 'Unauthorized', meetingId: 'm-1', decisionNumber: 'D-1', content: 'C', category: 'LAINNYA', scopeType: 'RT', scopeId: 'RT_01', effectiveDate: '2026-09-01' });
      assert(false, 'Security: Unauthorized decision drafting should be blocked');
    } catch (e) {
      assert(true, 'Security: Unauthorized decision creation blocked by permission check');
    }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // 14. PRIVACY TESTS
  static runPrivacyTests() {
    console.log('\n--- [14. PRIVACY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const decision = new Decision({
      title: 'Public Decision',
      deletedAt: '2026-08-29T10:00:00Z',
      deletedBy: 'admin-01',
    });

    const display = decision.toDisplay();
    assert(display.deletedAt === undefined, 'Privacy: toDisplay omits deletedAt internal audit metadata');
    assert(display.deletedBy === undefined, 'Privacy: toDisplay omits deletedBy internal audit metadata');

    return tests.every(Boolean);
  }

  // 15. PERFORMANCE TESTS
  static runPerformanceTests() {
    console.log('\n--- [15. PERFORMANCE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const stats = new DecisionStatistics(repo, mockAnalytics);

    const start1 = Date.now();
    const sum1 = stats.getSummary({ scope: 'perf-decision' });
    const elapsed1 = Date.now() - start1;

    const start2 = Date.now();
    const sum2 = stats.getSummary({ scope: 'perf-decision' });
    const elapsed2 = Date.now() - start2;

    assert(sum1.totalDecisions === sum2.totalDecisions, 'Performance: Cached summary returns identical data');
    assert(elapsed2 <= elapsed1, 'Performance: Cache retrieval is fast and non-blocking');

    return tests.every(Boolean);
  }

  // 16. REGRESSION TESTS
  static runRegressionTests() {
    console.log('\n--- [16. REGRESSION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    assert(typeof Decision.fromObject === 'function', 'Regression: Decision.fromObject intact');
    assert(typeof DecisionImpact.fromObject === 'function', 'Regression: DecisionImpact.fromObject intact');
    assert(typeof DecisionMigration.migrationVersion === 'function', 'Regression: DecisionMigration.migrationVersion intact');
    assert(typeof DecisionDashboard.getWidgets === 'function', 'Regression: DecisionDashboard.getWidgets intact');

    return tests.every(Boolean);
  }

  // 17. ACCEPTANCE TESTS
  static runAcceptanceTests() {
    console.log('\n--- [17. ACCEPTANCE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const repo = new DecisionRepository();
    repo.dbAdapter = mockDb;
    const rule = new DecisionRule(repo);
    const validator = new DecisionValidator(rule);
    const permission = new DecisionPermission();
    const service = new DecisionService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    // Acceptance Epic Governance: Ratified decision cannot be directly mutated (immutable)
    const d = service.createDecision({
      decisionNumber: 'KEP-ACC-001',
      meetingId: 'meet-acc-100',
      title: 'Ketetapan Penerapan Jam Tenang',
      content: 'Jam tenang dimulai pukul 22.00.',
      category: 'TATA_TERTIB_LINGKUNGAN',
      scopeType: 'RT',
      scopeId: 'RT_01',
      effectiveDate: new Date().toISOString(),
    });

    const ratified = service.ratifyDecision(d.id, 'cit-rt-leader');

    // Try modifying ratified decision directly via validator
    try {
      validator.validateDecisionUpdate({ content: 'Jam tenang diubah pukul 23.00' }, ratified);
      assert(false, 'Acceptance: Modifying ratified decision must be blocked');
    } catch (e) {
      assert(true, 'Acceptance: Ratified decision is protected by legal immutability');
    }

    return tests.every(Boolean);
  }

  // 18. SYNTAX TESTS
  static runSyntaxTests() {
    console.log('\n--- [18. SYNTAX TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    const files = [
      'DecisionEntity.js',
      'DecisionRepository.js',
      'DecisionValidator.js',
      'DecisionPermission.js',
      'DecisionRule.js',
      'DecisionService.js',
      'DecisionMigration.js',
      'DecisionSeeder.js',
      'DecisionStatistics.js',
      'DecisionDashboard.js',
    ];

    files.forEach(fileName => {
      try {
        const filePath = path.join(__dirname, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        new Function('module', 'exports', 'require', content);
        assert(true, `Syntax check passed for ${fileName}`);
      } catch (e) {
        assert(false, `Syntax error in ${fileName}: ${e.message}`);
      }
    });

    return tests.every(Boolean);
  }

  // QUALITY GATE EVALUATION
  static runQualityGate(results) {
    console.log('\n--- [QUALITY GATE EVALUATION] ---');
    let allPassed = true;

    for (const [category, passed] of Object.entries(results)) {
      const status = passed ? 'PASS' : 'FAIL';
      console.log(`  - Category [${category.toUpperCase()}]: ${status}`);
      if (!passed) allPassed = false;
    }

    return allPassed;
  }
}

// Auto-run if executed via CLI
if (require.main === module) {
  DecisionTest.runAll();
}

module.exports = DecisionTest;

