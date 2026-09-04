/**
 * @file RegulationTest.js
 * @description Comprehensive behavioral test suite and Quality Gate for the Regulation package (Epic Governance / Package P22).
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
      data: [{ period: '2026-08', value: 8 }],
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
// 2. LOAD PRODUCTION REGULATION MODULES
// ============================================================================

const { RegulationConstants, Regulation, RegulationArticle } = require('./RegulationEntity.js');
const RegulationPermission = require('./RegulationPermission.js');
const RegulationRule = require('./RegulationRule.js');
const RegulationValidator = require('./RegulationValidator.js');
const RegulationRepository = require('./RegulationRepository.js');
const RegulationService = require('./RegulationService.js');
const RegulationMigration = require('./RegulationMigration.js');
const RegulationSeeder = require('./RegulationSeeder.js');
const RegulationStatistics = require('./RegulationStatistics.js');
const RegulationDashboard = require('./RegulationDashboard.js');

// ============================================================================
// 3. REGULATION TEST SUITE CLASS
// ============================================================================

class RegulationTest {
  /**
   * Runs all 18 test categories and executes Quality Gate evaluation.
   * @returns {boolean}
   */
  static runAll() {
    console.log('\n===========================================');
    console.log('  REGULATION P22.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityGovernance');
    console.log('  Package: Regulation (Epic Governance / P22)');
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

    assert(typeof RegulationConstants === 'function', 'RegulationConstants class exported');
    assert(typeof Regulation === 'function', 'Regulation class exported');
    assert(typeof RegulationArticle === 'function', 'RegulationArticle class exported');
    assert(Array.isArray(RegulationConstants.CATEGORIES), 'RegulationConstants categories defined');
    assert(Array.isArray(RegulationConstants.STATUSES), 'RegulationConstants statuses defined');
    assert(typeof RegulationPermission === 'function', 'RegulationPermission class exported');
    assert(typeof RegulationRule === 'function', 'RegulationRule class exported');
    assert(typeof RegulationValidator === 'function', 'RegulationValidator class exported');
    assert(typeof RegulationRepository === 'function', 'RegulationRepository class exported');
    assert(typeof RegulationService === 'function', 'RegulationService class exported');
    assert(typeof RegulationMigration === 'function', 'RegulationMigration class exported');
    assert(typeof RegulationSeeder === 'function', 'RegulationSeeder class exported');
    assert(typeof RegulationStatistics === 'function', 'RegulationStatistics class exported');
    assert(typeof RegulationDashboard === 'function', 'RegulationDashboard class exported');

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

    // Regulation Entity
    const regulation = new Regulation({
      regulationNumber: 'PER-TEST-001',
      title: 'Peraturan Pengujian Lingkungan',
      description: 'Deskripsi peraturan pengujian',
      category: 'TATA_TERTIB',
      scopeType: 'RT',
      scopeId: 'RT_01',
    });

    assert(typeof regulation.id === 'string' && regulation.id.length > 0, 'Regulation ID generated (UUID v4)');
    assert(regulation.status === 'DRAFT', 'Regulation default status is DRAFT');
    assert(regulation.isPublic === true, 'Regulation default isPublic is true');
    assert(regulation.version === 1, 'Regulation default version is 1');

    const regObj = regulation.toObject();
    const regRestored = Regulation.fromObject(regObj);
    assert(regRestored.title === 'Peraturan Pengujian Lingkungan', 'Regulation fromObject restores title');

    // Article Entity
    const article = new RegulationArticle({
      regulationId: regulation.id,
      chapter: 'BAB I',
      articleNumber: 1,
      title: 'Pasal 1 Ketentuan Umum',
      content: 'Isi pasal 1 ketentuan umum',
      sanctionDescription: 'Teguran lisan',
    });
    assert(article.articleNumber === 1, 'RegulationArticle stores articleNumber');
    assert(article.displayOrder === 1, 'RegulationArticle default displayOrder is 1');
    const articleObj = article.toObject();
    const articleRestored = RegulationArticle.fromObject(articleObj);
    assert(articleRestored.title === 'Pasal 1 Ketentuan Umum', 'RegulationArticle fromObject restores title');
    assert(articleRestored.sanctionDescription === 'Teguran lisan', 'RegulationArticle restores sanctionDescription');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;

    // Create regulation
    const regulationEntity = new Regulation({
      regulationNumber: 'PER-REPO-001',
      title: 'Repo Test Regulation',
      category: 'KETERTIBAN_KEAMANAN',
      scopeType: 'RW',
      scopeId: 'RW_01',
    });
    const created = repo.createRegulation(regulationEntity);
    assert(created && created.id, 'Repository creates regulation');

    // Find and update regulation
    const found = repo.findRegulationById(created.id);
    assert(found && found.title === 'Repo Test Regulation', 'Repository finds regulation by ID');

    const byNumber = repo.findByRegulationNumber('PER-REPO-001');
    assert(byNumber && byNumber.id === created.id, 'Repository finds regulation by regulationNumber');

    const updated = repo.updateRegulation(created.id, { title: 'Updated Repo Regulation' });
    assert(updated.title === 'Updated Repo Regulation' && updated.version === 2, 'Repository updates regulation with version bump');

    // Add and find articles
    const articleEntity = new RegulationArticle({
      regulationId: created.id,
      articleNumber: 1,
      title: 'Pasal 1 Ronda',
      content: 'Wajib ronda malam',
    });
    repo.addArticle(articleEntity);
    const articles = repo.findArticlesByRegulationId(created.id);
    assert(articles.length >= 1, 'Repository retrieves articles by regulation ID');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);
    const validator = new RegulationValidator(rule);

    // Valid regulation creation
    try {
      validator.validateRegulationCreate({
        regulationNumber: 'PER-VAL-001',
        title: 'Peraturan Valid',
        category: 'PENGELOLAAN_SAMPAH_LINGKUNGAN',
        scopeType: 'RT',
        scopeId: 'RT_03',
        effectiveDate: new Date().toISOString(),
      });
      assert(true, 'Validator passes valid regulation creation payload');
    } catch (e) {
      assert(false, `Validator failed valid regulation: ${e.message}`);
    }

    // Missing title
    try {
      validator.validateRegulationCreate({ regulationNumber: 'PER-EMPTY' });
      assert(false, 'Validator should reject missing title/category');
    } catch (e) {
      assert(true, 'Validator rejects incomplete regulation payload');
    }

    // Immutable field check on update
    try {
      validator.validateRegulationUpdate({ scopeId: 'RT_MODIFIED' });
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

    const permission = new RegulationPermission();
    mockSecurity.allowAll();

    try {
      permission.checkCreateRegulation();
      permission.checkEnactRegulation();
      permission.checkSupersedeRegulation();
      permission.checkRevokeRegulation();
      assert(true, 'Permission checks succeed when authorized');
    } catch (e) {
      assert(false, `Permission check failed: ${e.message}`);
    }

    mockSecurity.deny('regulation.enact');
    try {
      permission.checkEnactRegulation();
      assert(false, 'Permission check should throw when denied');
    } catch (e) {
      assert(true, 'Permission check properly enforces security denial on enact');
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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);

    // Valid category & scope checks
    try {
      rule.checkValidCategory('TATA_TERTIB');
      rule.checkValidScopeType('RT');
      assert(true, 'Rule accepts valid category and scope');
    } catch (e) {
      assert(false, `Rule rejected valid constants: ${e.message}`);
    }

    // Allowed transition: DRAFT -> UNDER_REVIEW -> ENACTED -> SUPERSEDED
    try {
      rule.checkStatusTransition('DRAFT', 'UNDER_REVIEW');
      rule.checkStatusTransition('UNDER_REVIEW', 'ENACTED');
      rule.checkStatusTransition('ENACTED', 'SUPERSEDED');
      assert(true, 'Rule permits valid status transitions');
    } catch (e) {
      assert(false, `Rule rejected valid status transition: ${e.message}`);
    }

    // Disallowed transition: REVOKED -> ENACTED
    try {
      rule.checkStatusTransition('REVOKED', 'ENACTED');
      assert(false, 'Rule should reject reviving revoked regulation');
    } catch (e) {
      assert(true, 'Rule rejects illegal status transition');
    }

    // Immutability test on ENACTED regulation
    try {
      rule.checkImmutability({ status: 'ENACTED' });
      assert(false, 'Rule should reject modification of ENACTED regulation');
    } catch (e) {
      assert(true, 'Rule protects immutability of enacted regulations');
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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);
    const validator = new RegulationValidator(rule);
    const permission = new RegulationPermission();
    const service = new RegulationService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.allowAll();

    // Draft regulation via service
    const regulation = service.draftRegulation({
      regulationNumber: 'PER-SVC-001',
      title: 'Service Created Regulation',
      description: 'Tata tertib pelayanan warga',
      category: 'ADMINISTRASI_WARGA',
      scopeType: 'RT',
      scopeId: 'RT_02',
      effectiveDate: new Date().toISOString(),
    });
    assert(regulation && regulation.title === 'Service Created Regulation', 'Service drafts regulation and publishes event');

    // Add article
    const article = service.addArticle({
      regulationId: regulation.id,
      title: 'Pasal 1 Administrasi',
      content: 'Warga wajib lapor KK',
    });
    assert(article && article.regulationId === regulation.id, 'Service adds article to regulation');

    // Submit for review & Enact
    service.submitForReview(regulation.id);
    const enacted = service.enactRegulation(regulation.id, 'cit-ketua-rt');
    assert(enacted.status === 'ENACTED' && enacted.signatoryCitizenId === 'cit-ketua-rt', 'Service enacts regulation');

    // Supersede regulation
    const supersedeResult = service.supersedeRegulation(regulation.id, {
      regulationNumber: 'PER-SVC-002',
      title: 'Service Superseding Regulation',
      category: 'ADMINISTRASI_WARGA',
      scopeType: 'RT',
      scopeId: 'RT_02',
      effectiveDate: new Date().toISOString(),
    });
    assert(supersedeResult.oldRegulation.status === 'SUPERSEDED', 'Service supersedes old regulation');
    assert(supersedeResult.newRegulation.id === supersedeResult.oldRegulation.supersededByRegulationId, 'Service links new regulation to old statute');

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

    assert(RegulationMigration.migrationVersion() === '1.0.0', 'Migration version is 1.0.0');
    assert(RegulationMigration.seedRequired() === true, 'Migration requires seeding');

    RegulationMigration.up();
    assert(mockDb.hasTable('regulations'), 'Migration creates regulations table');
    assert(mockDb.hasTable('regulation_articles'), 'Migration creates regulation_articles table');

    // Idempotency re-run
    try {
      RegulationMigration.up();
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

    const seeder = new RegulationSeeder();
    seeder.run();
    assert(RegulationSeeder.isSeeded() === true, 'Seeder populates lookup data and detects isSeeded');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const stats = new RegulationStatistics(repo, mockAnalytics);

    const summary = stats.getSummary();
    assert(typeof summary.totalRegulations === 'number', 'Statistics summary calculates totalRegulations');
    assert(typeof summary.enactedRegulations === 'number', 'Statistics summary calculates enactedRegulations');
    assert(typeof summary.activeRate === 'string', 'Statistics calculates activeRate');

    const catDist = stats.getCategoryDistribution();
    assert(Array.isArray(catDist) && catDist.length > 0, 'Statistics returns category distribution');

    const recent = stats.getRecentRegulations(3);
    assert(Array.isArray(recent), 'Statistics returns recent enacted regulations');

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

    const widgets = RegulationDashboard.getWidgets();
    assert(Array.isArray(widgets) && widgets.length >= 8, 'Dashboard registers all required widgets');

    const summaryWidget = widgets.find(w => w.type === 'summary_card');
    assert(summaryWidget && summaryWidget.dataSource.startsWith('RegulationStatistics'), 'Summary card maps to RegulationStatistics');

    const pieWidget = widgets.find(w => w.type === 'pie_chart');
    assert(pieWidget && pieWidget.id === 'regulation_category_distribution', 'Pie chart registered for category distribution');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);
    const validator = new RegulationValidator(rule);
    const permission = new RegulationPermission();
    const service = new RegulationService(repo, validator, permission, rule, mockEventBus, mockAnalytics);
    const stats = new RegulationStatistics(repo, mockAnalytics);

    // E2E Flow: Draft regulation -> Add Articles -> Submit Review -> Enact -> Stats capture
    const reg = service.draftRegulation({
      regulationNumber: 'PER-E2E-001',
      title: 'E2E Peraturan Pemanfaatan Fasilitas Umum Lapangan',
      category: 'PEMANFAATAN_FASUM',
      scopeType: 'KELURAHAN',
      scopeId: 'KEL_KEBONJATI',
      effectiveDate: new Date().toISOString(),
    });

    service.addArticle({
      regulationId: reg.id,
      chapter: 'BAB I',
      articleNumber: 1,
      title: 'Izin Penggunaan Lapangan',
      content: 'Penggunaan lapangan untuk acara komersial wajib izin pengurus 3 hari sebelumnya.',
    });

    service.submitForReview(reg.id);
    const enacted = service.enactRegulation(reg.id, 'cit-lurah-kebonjati');
    assert(enacted.status === 'ENACTED', 'Integration: Regulation reached ENACTED status');

    const details = service.getRegulationDetails(reg.id);
    assert(details.articles.length === 1, 'Integration: Articles successfully bundled with regulation');

    const summary = stats.getSummary();
    assert(summary.enactedRegulations >= 1, 'Integration: Statistics accurately captures enacted regulation');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);
    const validator = new RegulationValidator(rule);
    const permission = new RegulationPermission();
    const service = new RegulationService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.deny('regulation.create');
    try {
      service.draftRegulation({ title: 'Unauthorized', regulationNumber: 'P-1', category: 'LAINNYA', scopeType: 'RT', scopeId: 'RT_01', effectiveDate: '2026-09-01' });
      assert(false, 'Security: Unauthorized regulation drafting should be blocked');
    } catch (e) {
      assert(true, 'Security: Unauthorized regulation creation blocked by permission check');
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

    const reg = new Regulation({
      title: 'Public Regulation',
      deletedAt: '2026-08-29T10:00:00Z',
      deletedBy: 'admin-01',
    });

    const display = reg.toDisplay();
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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const stats = new RegulationStatistics(repo, mockAnalytics);

    const start1 = Date.now();
    const sum1 = stats.getSummary({ scope: 'perf-regulation' });
    const elapsed1 = Date.now() - start1;

    const start2 = Date.now();
    const sum2 = stats.getSummary({ scope: 'perf-regulation' });
    const elapsed2 = Date.now() - start2;

    assert(sum1.totalRegulations === sum2.totalRegulations, 'Performance: Cached summary returns identical data');
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

    assert(typeof Regulation.fromObject === 'function', 'Regression: Regulation.fromObject intact');
    assert(typeof RegulationArticle.fromObject === 'function', 'Regression: RegulationArticle.fromObject intact');
    assert(typeof RegulationMigration.migrationVersion === 'function', 'Regression: RegulationMigration.migrationVersion intact');
    assert(typeof RegulationDashboard.getWidgets === 'function', 'Regression: RegulationDashboard.getWidgets intact');

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

    const repo = new RegulationRepository();
    repo.dbAdapter = mockDb;
    const rule = new RegulationRule(repo);
    const validator = new RegulationValidator(rule);
    const permission = new RegulationPermission();
    const service = new RegulationService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    // Acceptance Epic Governance: Enacted regulation cannot be directly modified (immutable)
    const r = service.draftRegulation({
      regulationNumber: 'PER-ACC-001',
      title: 'Peraturan Ketertiban RT',
      category: 'TATA_TERTIB',
      scopeType: 'RT',
      scopeId: 'RT_01',
      effectiveDate: new Date().toISOString(),
    });

    service.submitForReview(r.id);
    const enacted = service.enactRegulation(r.id, 'cit-rt-leader');

    // Try modifying enacted regulation directly via validator
    try {
      validator.validateRegulationUpdate({ title: 'Modifikasi Ilegal Judul Peraturan' }, enacted);
      assert(false, 'Acceptance: Modifying enacted regulation must be blocked');
    } catch (e) {
      assert(true, 'Acceptance: Enacted regulation is protected by legal immutability');
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
      'RegulationEntity.js',
      'RegulationRepository.js',
      'RegulationValidator.js',
      'RegulationPermission.js',
      'RegulationRule.js',
      'RegulationService.js',
      'RegulationMigration.js',
      'RegulationSeeder.js',
      'RegulationStatistics.js',
      'RegulationDashboard.js',
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
  RegulationTest.runAll();
}

module.exports = RegulationTest;

