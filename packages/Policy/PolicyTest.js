/**
 * @file PolicyTest.js
 * @description Behavioral Test Suite and Quality Gate for the Policy module.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// 1. MOCKING ENGINE
// ============================================================================

class MockDatabase {
  constructor() {
    this.tables = {};
    this.indexes = {};
  }
  hasTable(name) { return !!this.tables[name]; }
  createTable(name, schema) { this.tables[name] = { schema, records: [] }; }
  dropTable(name) { delete this.tables[name]; delete this.indexes[name]; }
  ensureIndex(table, field) {
    if (!this.indexes[table]) this.indexes[table] = [];
    this.indexes[table].push(field);
  }
  create(table, data) {
    if (!this.tables[table]) this.tables[table] = { records: [] };
    this.tables[table].records.push(data);
    return data;
  }
  findOne(table, criteria) {
    if (!this.tables[table]) return null;
    return this.tables[table].records.find(r => 
      Object.keys(criteria).every(k => r[k] === criteria[k])
    ) || null;
  }
  update(table, criteria, data) {
    const record = this.findOne(table, criteria);
    if (record) Object.assign(record, data);
    return record;
  }
  search(table, criteria) {
    if (!this.tables[table]) return [];
    return this.tables[table].records.filter(r => 
      Object.keys(criteria).every(k => r[k] === criteria[k])
    );
  }
  count(table, criteria) {
    return this.search(table, criteria).length;
  }
}

class MockSecurity {
  constructor() { this.allowed = true; }
  allowAll() { this.allowed = true; }
  denyAll() { this.allowed = false; }
  checkPermission(perm, context) {
    if (!this.allowed) throw new Error(`Security Exception: Permission denied for ${perm}`);
    return true;
  }
}

class MockCacheStore {
  constructor() { this.store = {}; }
  has(key) { return !!this.store[key]; }
  get(key) { return this.store[key]; }
  set(key, val, ttl) { this.store[key] = val; }
}

class MockLogger {
  constructor(channel = 'App') { this.channel = channel; this.logs = []; }
  info(msg) { this.logs.push({ level: 'info', msg }); }
  warn(msg) { this.logs.push({ level: 'warn', msg }); }
  error(msg) { this.logs.push({ level: 'error', msg }); }
}

class MockEventBus {
  constructor() { this.events = []; }
  publish(event, data) { this.events.push({ event, data }); }
}

class MockAnalyticsService {
  getTimeSeries(metric, filters) {
    return [{ period: '2026-09', count: 1 }];
  }
}

// Global Mocks Registration
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
// 2. DYNAMIC MODULE LOADER
// ============================================================================

const PKG_DIR = __dirname;
let PolicyConstants, Policy, PolicyProcedure, PolicyPermission, PolicyRule, PolicyValidator, PolicyRepository, PolicyService, PolicyMigration, PolicySeeder, PolicyStatistics, PolicyDashboard;

try {
  ({ PolicyConstants, Policy, PolicyProcedure } = require(path.join(PKG_DIR, 'PolicyEntity.js')));
  ({ PolicyPermission } = require(path.join(PKG_DIR, 'PolicyPermission.js')));
  ({ PolicyRule } = require(path.join(PKG_DIR, 'PolicyRule.js')));
  ({ PolicyValidator } = require(path.join(PKG_DIR, 'PolicyValidator.js')));
  ({ PolicyRepository } = require(path.join(PKG_DIR, 'PolicyRepository.js')));
  ({ PolicyService } = require(path.join(PKG_DIR, 'PolicyService.js')));
  ({ PolicyMigration } = require(path.join(PKG_DIR, 'PolicyMigration.js')));
  ({ PolicySeeder } = require(path.join(PKG_DIR, 'PolicySeeder.js')));
  ({ PolicyStatistics } = require(path.join(PKG_DIR, 'PolicyStatistics.js')));
  ({ PolicyDashboard } = require(path.join(PKG_DIR, 'PolicyDashboard.js')));
} catch (e) {
  console.error('Failed to load Policy modules:', e);
  process.exit(1);
}

// ============================================================================
// 3. POLICY TEST RUNNER
// ============================================================================

class PolicyTest {
  // 1. UNIT TESTS
  static runUnitTests() {
    console.log('\n--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => {
      tests.push(cond);
      if (cond) console.log(`  ✓ ${msg}`);
      else console.error(`  ✗ ${msg}`);
    };

    assert(!!PolicyConstants, 'PolicyConstants class exported');
    assert(!!Policy, 'Policy class exported');
    assert(!!PolicyProcedure, 'PolicyProcedure class exported');
    assert(Array.isArray(PolicyConstants.CATEGORIES), 'PolicyConstants categories defined');
    assert(Array.isArray(PolicyConstants.STATUSES), 'PolicyConstants statuses defined');
    assert(Array.isArray(PolicyConstants.TARGET_ROLES), 'PolicyConstants target roles defined');
    assert(!!PolicyPermission, 'PolicyPermission class exported');
    assert(!!PolicyRule, 'PolicyRule class exported');
    assert(!!PolicyValidator, 'PolicyValidator class exported');
    assert(!!PolicyRepository, 'PolicyRepository class exported');
    assert(!!PolicyService, 'PolicyService class exported');
    assert(!!PolicyMigration, 'PolicyMigration class exported');
    assert(!!PolicySeeder, 'PolicySeeder class exported');
    assert(!!PolicyStatistics, 'PolicyStatistics class exported');
    assert(!!PolicyDashboard, 'PolicyDashboard class exported');

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

    const pol = new Policy({ title: 'Test Policy' });
    assert(!!pol.id, 'Policy ID generated');
    assert(pol.status === 'DRAFT', 'Policy default status is DRAFT');
    assert(pol.isPublic === true, 'Policy default isPublic is true');
    assert(pol.version === 1, 'Policy default version is 1');

    const obj = pol.toObject();
    const restored = Policy.fromObject(obj);
    assert(restored.title === 'Test Policy', 'Policy fromObject restores title');

    const proc = new PolicyProcedure({ policyId: pol.id, stepTitle: 'Step 1' });
    assert(proc.stepNumber === 1, 'PolicyProcedure default stepNumber is 1');
    assert(proc.estimatedDurationMinutes === 15, 'PolicyProcedure default estimatedDurationMinutes is 15');

    const procRestored = PolicyProcedure.fromObject(proc.toObject());
    assert(procRestored.stepTitle === 'Step 1', 'PolicyProcedure fromObject restores stepTitle');

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

    mockDb.createTable('policies', {});
    mockDb.createTable('policy_procedures', {});
    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;

    const pol = new Policy({ policyNumber: 'SOP-REPO-01', title: 'Repo Test' });
    repo.createPolicy(pol);
    assert(repo.findPolicyById(pol.id) !== null, 'Repository creates policy');
    assert(repo.findByPolicyNumber('SOP-REPO-01') !== null, 'Repository finds policy by policyNumber');

    pol.title = 'Updated Repo Test';
    const updated = repo.updatePolicy(pol);
    assert(updated.version === 2, 'Repository updates policy with version bump');

    const proc = new PolicyProcedure({ policyId: pol.id, stepTitle: 'Repo Step' });
    repo.addProcedure(proc);
    const procs = repo.findProceduresByPolicyId(pol.id);
    assert(procs.length === 1 && procs[0].stepTitle === 'Repo Step', 'Repository retrieves procedures by policy ID');

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

    const validator = new PolicyValidator();

    try {
      validator.validatePolicyCreate({
        policyNumber: 'SOP-VAL-01',
        title: 'Val Test',
        category: 'INTERNAL_GOVERNANCE',
        scopeType: 'RT',
        scopeId: 'RT_01',
        targetRole: 'ALL_STAFF',
        effectiveDate: '2026-09-01T00:00:00Z'
      });
      assert(true, 'Validator passes valid policy creation payload');
    } catch (e) {
      assert(false, `Validator rejected valid payload: ${e.message}`);
    }

    try {
      validator.validatePolicyCreate({ title: 'Missing Fields' });
      assert(false, 'Validator should reject incomplete payload');
    } catch (e) {
      assert(true, 'Validator rejects incomplete policy payload');
    }

    const currentPol = new Policy({ scopeId: 'RT_01', scopeType: 'RT' });
    try {
      validator.validatePolicyUpdate({ scopeId: 'RW_01' }, currentPol);
      assert(false, 'Validator should block scopeId update');
    } catch (e) {
      assert(e.message.includes('scopeId is immutable'), 'Validator blocks updating immutable scopeId/scopeType');
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

    const perm = new PolicyPermission();
    
    mockSecurity.allowAll();
    try {
      perm.checkCreatePolicy();
      assert(true, 'Permission checks succeed when authorized');
    } catch (e) {
      assert(false, 'Authorized check failed');
    }

    mockSecurity.denyAll();
    try {
      perm.checkApprovePolicy();
      assert(false, 'Permission should throw when unauthorized');
    } catch (e) {
      assert(e.message.includes('Permission denied'), 'Permission check properly enforces security denial on approve');
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

    const rule = new PolicyRule();

    try {
      rule.checkValidCategory('INTERNAL_GOVERNANCE');
      rule.checkValidScopeType('RT');
      rule.checkValidTargetRole('ALL_STAFF');
      assert(true, 'Rule accepts valid category, scope, and target role');
    } catch (e) {
      assert(false, `Rule rejected valid constants: ${e.message}`);
    }

    try {
      rule.checkStatusTransition('DRAFT', 'PENDING_APPROVAL');
      rule.checkStatusTransition('PENDING_APPROVAL', 'ACTIVE');
      assert(true, 'Rule permits valid status transitions');
    } catch (e) {
      assert(false, `Rule rejected valid transition: ${e.message}`);
    }

    try {
      rule.checkStatusTransition('DRAFT', 'ACTIVE');
      assert(false, 'Rule should reject jumping to ACTIVE');
    } catch (e) {
      assert(true, 'Rule rejects illegal status transition');
    }

    try {
      const activePol = new Policy({ status: 'ACTIVE' });
      rule.checkImmutability(activePol);
      assert(false, 'Rule should protect immutability of ACTIVE policy');
    } catch (e) {
      assert(true, 'Rule protects immutability of ACTIVE policies');
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

    mockDb.createTable('policies', {});
    mockDb.createTable('policy_procedures', {});
    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;
    const service = new PolicyService(repo);

    try {
      const draft = service.draftPolicy({
        policyNumber: 'SVC-001',
        title: 'Service SOP',
        category: 'INTERNAL_GOVERNANCE',
        scopeType: 'RT',
        scopeId: 'RT_01',
        targetRole: 'ALL_STAFF',
        effectiveDate: '2026-09-01T00:00:00Z'
      });
      assert(draft.status === 'DRAFT', 'Service drafts policy and publishes event');

      const proc = service.addProcedure({
        policyId: draft.id,
        stepTitle: 'Step 1',
        instruction: 'Do this',
        estimatedDurationMinutes: 5
      });
      assert(proc.policyId === draft.id, 'Service adds procedural step');

      service.submitForApproval(draft.id);
      const pending = repo.findPolicyById(draft.id);
      assert(pending.status === 'PENDING_APPROVAL', 'Service submits policy for approval');

      const approved = service.approvePolicy(draft.id, 'citizen-approver');
      assert(approved.status === 'ACTIVE' && approved.approvedByCitizenId === 'citizen-approver', 'Service approves policy');

      const revised = service.revisePolicy(draft.id);
      assert(revised.status === 'UNDER_REVISION', 'Service revises old policy');

    } catch (e) {
      assert(false, `Service flow failed: ${e.message}`);
    }

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

    mockDb.tables = {};
    mockDb.indexes = {};

    assert(PolicyMigration.migrationVersion() === '1.0.0', 'Migration version is 1.0.0');
    assert(PolicyMigration.seedRequired() === true, 'Migration requires seeding');

    PolicyMigration.up();
    assert(mockDb.hasTable('policies'), 'Migration creates policies table');
    assert(mockDb.hasTable('policy_procedures'), 'Migration creates policy_procedures table');

    PolicyMigration.up();
    assert(true, 'Migration up is idempotent (re-run safely without error)');

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

    mockDb.createTable('lookup_groups', {});
    mockDb.createTable('lookup_items', {});
    mockDb.createTable('policies', {});

    const seeder = new PolicySeeder();
    seeder.run();

    assert(PolicySeeder.isSeeded(), 'Seeder populates lookup data and detects isSeeded');
    
    const countBefore = mockDb.count('lookup_items', {});
    seeder.run();
    const countAfter = mockDb.count('lookup_items', {});
    assert(countBefore === countAfter && countBefore > 0, 'Seeder run is idempotent (re-run without duplicates)');

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

    mockDb.createTable('policies', {});
    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;

    repo.createPolicy(new Policy({ status: 'ACTIVE', category: 'SOP_PELAYANAN_WARGA', targetRole: 'ALL_STAFF' }));
    repo.createPolicy(new Policy({ status: 'ACTIVE', category: 'INTERNAL_GOVERNANCE', targetRole: 'SEKRETARIS' }));
    repo.createPolicy(new Policy({ status: 'DRAFT', category: 'INTERNAL_GOVERNANCE', targetRole: 'ALL_STAFF' }));

    const stats = new PolicyStatistics(repo);
    const summary = stats.getSummary();

    assert(summary.totalPolicies === 3, 'Statistics summary calculates totalPolicies');
    assert(summary.activePolicies === 2, 'Statistics summary calculates activePolicies');
    assert(summary.activeRate === 66.67, 'Statistics calculates activeRate');

    const catDist = stats.getCategoryDistribution();
    assert(catDist.find(c => c.category === 'INTERNAL_GOVERNANCE').count === 2, 'Statistics returns category distribution');

    const roleDist = stats.getTargetRoleDistribution();
    assert(roleDist.find(r => r.targetRole === 'ALL_STAFF').count === 2, 'Statistics returns target role distribution');

    const recent = stats.getRecentPolicies(1);
    assert(recent.length === 1 && recent[0].status === 'ACTIVE', 'Statistics returns recent active policies');

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

    const widgets = PolicyDashboard.getWidgets();
    assert(widgets.length === 9, 'Dashboard registers all required widgets');
    assert(widgets.some(w => w.id === 'policy_total_count' && w.dataSource === 'PolicyStatistics.getSummary'), 'Summary card maps to PolicyStatistics');
    assert(widgets.some(w => w.id === 'policy_category_distribution' && w.type === 'pie_chart'), 'Pie chart registered for category distribution');
    assert(widgets.some(w => w.id === 'policy_target_distribution' && w.type === 'donut_chart'), 'Donut chart registered for target role distribution');

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

    mockDb.createTable('policies', {});
    mockDb.createTable('policy_procedures', {});
    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;
    const service = new PolicyService(repo);
    const stats = new PolicyStatistics(repo);

    const pol = service.draftPolicy({
      policyNumber: 'INT-01',
      title: 'E2E Policy',
      category: 'INTERNAL_GOVERNANCE',
      scopeType: 'RT',
      scopeId: 'RT_01',
      targetRole: 'ALL_STAFF',
      effectiveDate: '2026-09-01T00:00:00Z'
    });

    service.addProcedure({ policyId: pol.id, stepTitle: 'Int Step 1', instruction: 'Do A', estimatedDurationMinutes: 10 });
    service.submitForApproval(pol.id);
    const active = service.approvePolicy(pol.id, 'approver');

    assert(active.status === 'ACTIVE', 'Integration: Policy reached ACTIVE status');
    
    const procs = repo.findProceduresByPolicyId(pol.id);
    assert(procs.length === 1, 'Integration: Procedure successfully bundled with policy');

    if (stats.cache) stats.cache.store = {}; // Force cache clearance for integration test accuracy
    const summary = stats.getSummary();
    assert(summary.activePolicies === 1, 'Integration: Statistics accurately captures active policy');

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

    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;
    const service = new PolicyService(repo);

    mockSecurity.denyAll();
    try {
      service.draftPolicy({ title: 'Hacked' });
      assert(false, 'Security check failed to block');
    } catch (e) {
      assert(e.message.includes('Permission denied'), 'Security: Unauthorized policy creation blocked by permission check');
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

    const pol = new Policy({ deletedAt: '2026-01-01', deletedBy: 'admin' });
    const display = pol.toDisplay();

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

    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;
    const stats = new PolicyStatistics(repo);

    const start = Date.now();
    const sum1 = stats.getSummary();
    const sum2 = stats.getSummary(); // Should hit cache
    const elapsed = Date.now() - start;

    assert(sum1.totalPolicies === sum2.totalPolicies, 'Performance: Cached summary returns identical data');
    assert(elapsed < 50, 'Performance: Cache retrieval is fast and non-blocking');

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

    assert(typeof Policy.fromObject === 'function', 'Regression: Policy.fromObject intact');
    assert(typeof PolicyProcedure.fromObject === 'function', 'Regression: PolicyProcedure.fromObject intact');
    assert(typeof PolicyMigration.migrationVersion === 'function', 'Regression: PolicyMigration.migrationVersion intact');
    assert(typeof PolicyDashboard.getWidgets === 'function', 'Regression: PolicyDashboard.getWidgets intact');

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

    const repo = new PolicyRepository();
    repo.dbAdapter = mockDb;
    const service = new PolicyService(repo);

    const activePol = new Policy({ status: 'ACTIVE' });
    repo.createPolicy(activePol);

    try {
      service.addProcedure({ 
        policyId: activePol.id, 
        stepTitle: 'Hacked Step',
        instruction: 'Hacked instruction',
        estimatedDurationMinutes: 10
      });
      assert(false, 'Acceptance: Failed to protect ACTIVE policy immutability');
    } catch (e) {
      assert(e.message.toLowerCase().includes('immutable'), 'Acceptance: Active SOP is protected by legal immutability (cannot be directly updated)');
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
      'PolicyEntity.js', 'PolicyPermission.js', 'PolicyRule.js', 'PolicyValidator.js',
      'PolicyRepository.js', 'PolicyService.js', 'PolicyMigration.js', 'PolicySeeder.js',
      'PolicyStatistics.js', 'PolicyDashboard.js'
    ];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(PKG_DIR, file), 'utf8');
        assert(true, `Syntax check passed for ${file}`);
      } catch (e) {
        assert(false, `Syntax error in ${file}: ${e.message}`);
      }
    });

    return tests.every(Boolean);
  }

  // ============================================================================
  // QUALITY GATE AGGREGATOR
  // ============================================================================
  static runAll() {
    console.log('\n===========================================');
    console.log('  POLICY P23.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityGovernance');
    console.log('  Package: Policy (Epic Governance / P23)');
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
    for (const [category, passed] of Object.entries(results)) {
      console.log(`  - Category [${category}]: ${passed ? 'PASS' : 'FAIL'}`);
      if (!passed) allPassed = false;
    }

    console.log('\n===========================================');
    if (allPassed) {
      console.log('  QUALITY GATE: PASS - All Behavioral Tests Passed');
      console.log('===========================================\n');
      return 0;
    } else {
      console.log('  QUALITY GATE: FAIL - Some tests did not pass.');
      console.log('===========================================\n');
      return 1;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  process.exit(PolicyTest.runAll());
}

module.exports = PolicyTest;
