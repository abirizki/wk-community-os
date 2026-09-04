/**
 * @file CitizenTest.js
 * @description Behavioral Test Suite & Quality Gate — Citizen Module (P30)
 * @domain CommunityDemographics
 * @package Citizen (Epic Demographics / P30)
 */

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
    const rec = this.findOne(table, criteria);
    if (rec) Object.assign(rec, data);
    return rec;
  }
  search(table, criteria) {
    if (!this.tables[table]) return [];
    if (!criteria || Object.keys(criteria).length === 0) return [...this.tables[table].records];
    return this.tables[table].records.filter(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    );
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

class MockLogger {
  info(msg) {}
  warn(msg) {}
  error(msg) {}
}

class MockEventBus {
  constructor() { this.events = []; }
  publish(event, data) { this.events.push({ event, data }); }
}

class MockAnalyticsService {
  getTimeSeries() { return []; }
}

// Global mock caches registry
const mockCaches = new Map();
const mockDb = new MockDatabase();
const mockSecurity = new MockSecurity();
const mockEventBus = new MockEventBus();

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
    if (name === 'AnalyticsService') return new MockAnalyticsService();
    return null;
  },
  user: () => ({ id: 'admin-rt-001', name: 'Ketua RT 02' }),
};

// ============================================================================
// 2. DYNAMIC MODULE LOADER
// ============================================================================

const PKG_DIR = __dirname;
let CitizenConstants, AdministrativeRegion, Family, Citizen;
let CitizenPermission, CitizenRule, CitizenValidator, CitizenRepository, CitizenService;
let CitizenMigration, CitizenSeeder, CitizenStatistics, CitizenDashboard;

try {
  ({ CitizenConstants, AdministrativeRegion, Family, Citizen } = require(path.join(PKG_DIR, 'CitizenEntity.js')));
  ({ CitizenPermission } = require(path.join(PKG_DIR, 'CitizenPermission.js')));
  ({ CitizenRule } = require(path.join(PKG_DIR, 'CitizenRule.js')));
  ({ CitizenValidator } = require(path.join(PKG_DIR, 'CitizenValidator.js')));
  ({ CitizenRepository } = require(path.join(PKG_DIR, 'CitizenRepository.js')));
  ({ CitizenService } = require(path.join(PKG_DIR, 'CitizenService.js')));
  ({ CitizenMigration } = require(path.join(PKG_DIR, 'CitizenMigration.js')));
  ({ CitizenSeeder } = require(path.join(PKG_DIR, 'CitizenSeeder.js')));
  ({ CitizenStatistics } = require(path.join(PKG_DIR, 'CitizenStatistics.js')));
  ({ CitizenDashboard } = require(path.join(PKG_DIR, 'CitizenDashboard.js')));
} catch (e) {
  console.error('FATAL: Failed to load Citizen production modules:', e.message);
  process.exit(1);
}

// ============================================================================
// 3. HELPER — Create fresh db per test
// ============================================================================
function freshRepo() {
  const repo = new CitizenRepository();
  repo.dbAdapter = mockDb;
  return repo;
}

function freshService(repo) {
  return new CitizenService(repo || freshRepo());
}

// ============================================================================
// 4. CITIZEN TEST RUNNER
// ============================================================================

class CitizenTest {

  // 1. UNIT TESTS
  static runUnitTests() {
    console.log('\n--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    assert(!!CitizenConstants, 'CitizenConstants class exported');
    assert(!!AdministrativeRegion, 'AdministrativeRegion class exported');
    assert(!!Family, 'Family class exported');
    assert(!!Citizen, 'Citizen class exported');
    assert(Array.isArray(CitizenConstants.GENDERS), 'CitizenConstants.GENDERS defined');
    assert(Array.isArray(CitizenConstants.MARITAL_STATUSES), 'CitizenConstants.MARITAL_STATUSES defined');
    assert(Array.isArray(CitizenConstants.FAMILY_RELATIONS), 'CitizenConstants.FAMILY_RELATIONS defined');
    assert(Array.isArray(CitizenConstants.RESIDENCY_STATUSES), 'CitizenConstants.RESIDENCY_STATUSES defined');
    assert(Array.isArray(CitizenConstants.REGION_LEVELS), 'CitizenConstants.REGION_LEVELS defined');
    assert(!!CitizenPermission, 'CitizenPermission class exported');
    assert(!!CitizenRule, 'CitizenRule class exported');
    assert(!!CitizenValidator, 'CitizenValidator class exported');
    assert(!!CitizenRepository, 'CitizenRepository class exported');
    assert(!!CitizenService, 'CitizenService class exported');
    assert(!!CitizenMigration, 'CitizenMigration class exported');
    assert(!!CitizenSeeder, 'CitizenSeeder class exported');
    assert(!!CitizenStatistics, 'CitizenStatistics class exported');
    assert(!!CitizenDashboard, 'CitizenDashboard class exported');

    return tests.every(Boolean);
  }

  // 2. ENTITY TESTS
  static runEntityTests() {
    console.log('\n--- [2. ENTITY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    const region = new AdministrativeRegion({ name: 'RT 01', level: 'RT' });
    assert(!!region.id && region.id.includes('-'), 'AdministrativeRegion generates UUID v4 id');
    assert(region.level === 'RT', 'AdministrativeRegion default level set correctly');
    assert(region.version === 1, 'AdministrativeRegion default version is 1');
    assert(region.parentId === null, 'AdministrativeRegion default parentId is null');

    const regionObj = region.toObject();
    const regionRestored = AdministrativeRegion.fromObject(regionObj);
    assert(regionRestored.name === 'RT 01', 'AdministrativeRegion fromObject restores name');

    const fam = new Family({ id: '3273000000001234', regionId: region.id, address: 'Jl. Melati 1' });
    assert(fam.id === '3273000000001234', 'Family id set correctly');
    assert(fam.version === 1, 'Family default version is 1');
    assert(fam.headOfFamilyId === null, 'Family default headOfFamilyId is null');

    const famRestored = Family.fromObject(fam.toObject());
    assert(famRestored.address === 'Jl. Melati 1', 'Family fromObject restores address');

    const cit = new Citizen({ id: '3273010101900001', familyId: fam.id, fullName: 'Budi', gender: 'L', religion: 'ISLAM', birthDate: '1990-01-01' });
    assert(cit.residencyStatus === 'ACTIVE', 'Citizen default residencyStatus is ACTIVE');
    assert(cit.maritalStatus === 'BELUM_KAWIN', 'Citizen default maritalStatus is BELUM_KAWIN');
    assert(cit.version === 1, 'Citizen default version is 1');

    const citRestored = Citizen.fromObject(cit.toObject());
    assert(citRestored.fullName === 'Budi', 'Citizen fromObject restores fullName');

    return tests.every(Boolean);
  }

  // 3. REPOSITORY TESTS
  static runRepositoryTests() {
    console.log('\n--- [3. REPOSITORY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('administrative_regions', {});
    mockDb.createTable('families', {});
    mockDb.createTable('citizens', {});
    const repo = freshRepo();

    const region = new AdministrativeRegion({ name: 'RW 01', level: 'RW' });
    repo.createRegion(region);
    const foundRegions = repo.findRegionsByLevel('RW');
    assert(foundRegions.length >= 1, 'Repository finds regions by level');

    const fam = new Family({ id: '3273000000009999', regionId: region.id, address: 'Jl. Kebonjati 5' });
    repo.createFamily(fam);
    const foundFam = repo.findFamilyByKk('3273000000009999');
    assert(!!foundFam && foundFam.address === 'Jl. Kebonjati 5', 'Repository findFamilyByKk works');

    const cit = new Citizen({ id: '3273019901012001', familyId: fam.id, fullName: 'Sari', gender: 'P', religion: 'ISLAM', birthDate: '1990-01-01' });
    repo.createCitizen(cit);
    const foundCit = repo.findCitizenByNik('3273019901012001');
    assert(!!foundCit && foundCit.fullName === 'Sari', 'Repository findCitizenByNik works');

    cit.fullName = 'Sari Updated';
    const updatedCit = repo.updateCitizen(cit);
    assert(updatedCit.version === 2, 'Repository updateCitizen increments version (optimistic locking)');

    const members = repo.findMembersByFamilyId(fam.id);
    assert(members.length >= 1, 'Repository findMembersByFamilyId works');

    return tests.every(Boolean);
  }

  // 4. VALIDATION TESTS
  static runValidationTests() {
    console.log('\n--- [4. VALIDATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    const v = new CitizenValidator();

    try {
      v.validateRegionCreate({ name: 'RT 03', level: 'RT' });
      assert(true, 'Validator passes valid region payload');
    } catch (e) { assert(false, `Validator rejected valid region: ${e.message}`); }

    try {
      v.validateRegionCreate({ level: 'RT' });
      assert(false, 'Validator should reject region missing name');
    } catch (e) { assert(true, 'Validator rejects region without name'); }

    try {
      v.validateFamilyCreate({ id: '3273000000001111', regionId: 'region-id', address: 'Jl. Test' });
      assert(true, 'Validator passes valid family payload');
    } catch (e) { assert(false, `Validator rejected valid family: ${e.message}`); }

    try {
      v.validateFamilyCreate({ id: '12345', regionId: 'region-id', address: 'Jl. Test' });
      assert(false, 'Validator should reject KK not 16 digits');
    } catch (e) { assert(true, 'Validator rejects KK ID not exactly 16 digits'); }

    try {
      v.validateCitizenRegister({
        id: '3273010101900001',
        familyId: 'fam-1',
        fullName: 'Test',
        birthDate: '1990-01-01',
        gender: 'L',
        religion: 'ISLAM'
      });
      assert(true, 'Validator passes valid citizen payload');
    } catch (e) { assert(false, `Validator rejected valid citizen: ${e.message}`); }

    try {
      v.validateCitizenRegister({ id: '32730', familyId: 'fam-1', fullName: 'Test', birthDate: '1990-01-01', gender: 'L', religion: 'ISLAM' });
      assert(false, 'Validator should reject NIK not 16 digits');
    } catch (e) { assert(true, 'Validator rejects NIK not exactly 16 digits'); }

    return tests.every(Boolean);
  }

  // 5. PERMISSION TESTS
  static runPermissionTests() {
    console.log('\n--- [5. PERMISSION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockSecurity.allowAll();
    const perm = new CitizenPermission();

    try {
      perm.checkCreate();
      assert(true, 'Permission: authorized create passes');
    } catch (e) { assert(false, 'Permission: authorized create should pass'); }

    try {
      perm.checkViewStatistics();
      assert(true, 'Permission: authorized statistics view passes');
    } catch (e) { assert(false, 'Permission: authorized statistics should pass'); }

    mockSecurity.denyAll();
    try {
      perm.checkCreate();
      assert(false, 'Permission: denied create should throw');
    } catch (e) { assert(e.message.includes('Permission denied'), 'Permission: unauthorized create blocked'); }

    mockSecurity.allowAll();
    const perms = CitizenPermission.getPermissions();
    assert(Array.isArray(perms) && perms.length >= 5, 'Permission: all 5 permission keys registered');

    return tests.every(Boolean);
  }

  // 6. RULE TESTS
  static runRuleTests() {
    console.log('\n--- [6. RULE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    const rule = new CitizenRule();

    try { rule.checkValidGender('L'); assert(true, 'Rule: valid gender L accepted'); }
    catch (e) { assert(false, 'Rule: L is a valid gender'); }

    try { rule.checkValidGender('X'); assert(false, 'Rule: invalid gender should throw'); }
    catch (e) { assert(true, 'Rule: invalid gender rejected'); }

    try { rule.checkValidMaritalStatus('KAWIN'); assert(true, 'Rule: valid marital status KAWIN accepted'); }
    catch (e) { assert(false, 'Rule: KAWIN is a valid status'); }

    try { rule.checkValidFamilyRelation('ANAK'); assert(true, 'Rule: valid family relation ANAK accepted'); }
    catch (e) { assert(false, 'Rule: ANAK is a valid relation'); }

    try { rule.checkValidResidencyStatus('DECEASED'); assert(true, 'Rule: DECEASED is a valid residency status'); }
    catch (e) { assert(false, 'Rule: DECEASED should be valid'); }

    rule.checkUniqueNik('1234567890123456', null);
    assert(true, 'Rule: unique NIK check passes when no existing record');

    try {
      rule.checkUniqueNik('1234567890123456', { id: '1234567890123456' });
      assert(false, 'Rule: duplicate NIK should throw');
    } catch (e) { assert(true, 'Rule: duplicate NIK rejected'); }

    // DECEASED is terminal
    try {
      rule.checkResidencyTransition('DECEASED', 'ACTIVE');
      assert(false, 'Rule: DECEASED→ACTIVE transition should throw');
    } catch (e) { assert(true, 'Rule: DECEASED is a terminal residency state'); }

    try {
      rule.checkResidencyTransition('ACTIVE', 'MOVED_OUT');
      assert(true, 'Rule: ACTIVE→MOVED_OUT transition is allowed');
    } catch (e) { assert(false, 'Rule: ACTIVE→MOVED_OUT should be allowed'); }

    return tests.every(Boolean);
  }

  // 7. SERVICE TESTS
  static runServiceTests() {
    console.log('\n--- [7. SERVICE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('administrative_regions', {});
    mockDb.createTable('families', {});
    mockDb.createTable('citizens', {});
    const service = freshService();

    try {
      const region = service.registerRegion({ name: 'RT 04', level: 'RT' });
      assert(!!region.id, 'Service: registerRegion creates region with id');
    } catch (e) { assert(false, `Service registerRegion failed: ${e.message}`); }

    try {
      const fam = service.registerFamily({ id: '3273000000002222', regionId: 'some-region', address: 'Jl. Mawar 10' });
      assert(fam.id === '3273000000002222', 'Service: registerFamily persists family');
    } catch (e) { assert(false, `Service registerFamily failed: ${e.message}`); }

    try {
      const cit = service.registerCitizen({
        id: '3273010202900002',
        familyId: '3273000000002222',
        fullName: 'Dewi Sari',
        birthDate: '1990-02-02',
        gender: 'P',
        religion: 'ISLAM',
        maritalStatus: 'KAWIN',
        familyRelation: 'ISTRI'
      });
      assert(cit.residencyStatus === 'ACTIVE', 'Service: registerCitizen sets default ACTIVE status');
    } catch (e) { assert(false, `Service registerCitizen failed: ${e.message}`); }

    try {
      const updated = service.updateResidencyStatus('3273010202900002', 'TEMPORARY');
      assert(updated.residencyStatus === 'TEMPORARY', 'Service: updateResidencyStatus changes status');
    } catch (e) { assert(false, `Service updateResidencyStatus failed: ${e.message}`); }

    return tests.every(Boolean);
  }

  // 8. MIGRATION TESTS
  static runMigrationTests() {
    console.log('\n--- [8. MIGRATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    // Reset tables
    mockDb.tables = {};

    assert(CitizenMigration.migrationVersion() === '1.0.0', 'Migration: version is 1.0.0');
    assert(CitizenMigration.seedRequired() === true, 'Migration: seedRequired is true');

    CitizenMigration.up();
    assert(mockDb.hasTable('administrative_regions'), 'Migration: creates administrative_regions table');
    assert(mockDb.hasTable('families'), 'Migration: creates families table');
    assert(mockDb.hasTable('citizens'), 'Migration: creates citizens table');

    // Idempotency
    try { CitizenMigration.up(); assert(true, 'Migration: up() is idempotent (no error on re-run)'); }
    catch (e) { assert(false, `Migration up() not idempotent: ${e.message}`); }

    // Down
    CitizenMigration.down();
    assert(!mockDb.hasTable('citizens'), 'Migration: down() removes citizens table');
    assert(!mockDb.hasTable('families'), 'Migration: down() removes families table');
    assert(!mockDb.hasTable('administrative_regions'), 'Migration: down() removes administrative_regions table');

    return tests.every(Boolean);
  }

  // 9. SEEDER TESTS
  static runSeederTests() {
    console.log('\n--- [9. SEEDER TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('lookup_groups', {});
    mockDb.createTable('lookup_items', {});
    mockDb.createTable('citizens', {});

    const seeder = new CitizenSeeder();
    seeder.run();

    const group = mockDb.findOne('lookup_groups', { name: 'RESIDENCY_STATUS' });
    assert(!!group, 'Seeder: RESIDENCY_STATUS lookup group created');

    const countBefore = mockDb.count('lookup_items', {});
    assert(countBefore > 0, 'Seeder: lookup items populated');

    seeder.run(); // Re-run for idempotency
    const countAfter = mockDb.count('lookup_items', {});
    assert(countBefore === countAfter, 'Seeder: run() is idempotent (no duplicates on re-run)');

    assert(CitizenSeeder.isSeeded() === true, 'Seeder: isSeeded() returns true after seeding');

    // Count groups — should be 5
    const groupCount = mockDb.count('lookup_groups', {});
    assert(groupCount === 5, 'Seeder: all 5 lookup groups created (GENDER, MARITAL_STATUS, FAMILY_RELATION, RESIDENCY_STATUS, REGION_LEVEL)');

    return tests.every(Boolean);
  }

  // 10. STATISTICS TESTS
  static runStatisticsTests() {
    console.log('\n--- [10. STATISTICS TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('administrative_regions', {});
    mockDb.createTable('families', {});
    mockDb.createTable('citizens', {});
    const repo = freshRepo();

    repo.createFamily(new Family({ id: '3273000000008888', regionId: 'r1', address: 'Jl. Stat' }));
    repo.createFamily(new Family({ id: '3273000000007777', regionId: 'r1', address: 'Jl. Stat 2' }));
    repo.createCitizen(new Citizen({ id: '3273011001900010', familyId: '3273000000008888', fullName: 'A', gender: 'L', religion: 'ISLAM', birthDate: '1990-01-01', residencyStatus: 'ACTIVE' }));
    repo.createCitizen(new Citizen({ id: '3273012002800020', familyId: '3273000000008888', fullName: 'B', gender: 'P', religion: 'ISLAM', birthDate: '2005-05-05', residencyStatus: 'ACTIVE' }));
    repo.createCitizen(new Citizen({ id: '3273013003700030', familyId: '3273000000007777', fullName: 'C', gender: 'L', religion: 'ISLAM', birthDate: '2022-01-01', residencyStatus: 'TEMPORARY' }));

    // Clear cache to ensure fresh reads
    if (mockCaches.has('citizen_stats')) mockCaches.get('citizen_stats').store = {};

    const stats = new CitizenStatistics(repo);

    const summary = stats.getSummary();
    assert(summary.totalCitizens === 3, 'Statistics: totalCitizens is correct');
    assert(summary.totalFamilies === 2, 'Statistics: totalFamilies is correct');
    assert(summary.activeCitizens === 2, 'Statistics: activeCitizens is correct');
    assert(summary.temporaryCitizens === 1, 'Statistics: temporaryCitizens is correct');

    const genderDist = stats.getGenderDistribution();
    assert(genderDist.find(g => g.gender === 'L').count === 2, 'Statistics: gender distribution counts males');
    assert(genderDist.find(g => g.gender === 'P').count === 1, 'Statistics: gender distribution counts females');

    const residencyDist = stats.getResidencyDistribution();
    assert(residencyDist.find(r => r.status === 'ACTIVE').count === 2, 'Statistics: residency distribution counts ACTIVE');
    assert(residencyDist.find(r => r.status === 'TEMPORARY').count === 1, 'Statistics: residency distribution counts TEMPORARY');

    const ageDist = stats.getAgeDemographics();
    assert(ageDist.find(a => a.category.includes('Balita')).count >= 1, 'Statistics: age demographics identifies Balita group');
    assert(ageDist.find(a => a.category.includes('Dewasa')).count >= 1, 'Statistics: age demographics identifies Dewasa group');

    const recent = stats.getRecentRegistrations(2);
    assert(recent.length === 2, 'Statistics: getRecentRegistrations respects limit');

    return tests.every(Boolean);
  }

  // 11. DASHBOARD TESTS
  static runDashboardTests() {
    console.log('\n--- [11. DASHBOARD TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockSecurity.allowAll();
    const widgets = CitizenDashboard.getWidgets();

    assert(widgets.length === 6, 'Dashboard: registers 6 widgets');
    assert(widgets.some(w => w.type === 'summary_card'), 'Dashboard: summary_card widget registered');
    assert(widgets.some(w => w.type === 'pie_chart'), 'Dashboard: pie_chart widget registered for gender');
    assert(widgets.some(w => w.type === 'donut_chart'), 'Dashboard: donut_chart widget registered for residency');
    assert(widgets.some(w => w.type === 'bar_chart'), 'Dashboard: bar_chart widget registered for age');
    assert(widgets.some(w => w.type === 'table'), 'Dashboard: table widget registered for recent registrations');
    assert(widgets.some(w => w.type === 'quick_actions'), 'Dashboard: quick_actions widget registered');
    assert(widgets.find(w => w.type === 'summary_card').dataSource === 'CitizenStatistics.getSummary', 'Dashboard: summary_card maps to CitizenStatistics.getSummary');

    return tests.every(Boolean);
  }

  // 12. INTEGRATION TESTS
  static runIntegrationTests() {
    console.log('\n--- [12. INTEGRATION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('administrative_regions', {});
    mockDb.createTable('families', {});
    mockDb.createTable('citizens', {});
    const repo = freshRepo();
    const service = new CitizenService(repo);

    const region = service.registerRegion({ name: 'RT 07', level: 'RT' });
    assert(!!region.id, 'Integration: region registered successfully');

    const fam = service.registerFamily({ id: '3273000000005555', regionId: region.id, address: 'Jl. Integrasi 1' });
    assert(fam.id === '3273000000005555', 'Integration: family registered successfully');

    const cit = service.registerCitizen({
      id: '3273010707900007',
      familyId: fam.id,
      fullName: 'Pak Integrasi',
      birthDate: '1975-07-07',
      gender: 'L',
      religion: 'ISLAM',
      maritalStatus: 'KAWIN',
      familyRelation: 'KEPALA_KELUARGA'
    });
    assert(cit.residencyStatus === 'ACTIVE', 'Integration: citizen registered with ACTIVE status');

    // Verify member lookup
    const members = repo.findMembersByFamilyId(fam.id);
    assert(members.length === 1, 'Integration: family member lookup returns correct count');

    // Stats reflect new citizen
    if (mockCaches.has('citizen_stats')) mockCaches.get('citizen_stats').store = {};
    const stats = new CitizenStatistics(repo);
    const summary = stats.getSummary();
    assert(summary.activeCitizens >= 1, 'Integration: Statistics reflect newly registered active citizen');

    return tests.every(Boolean);
  }

  // 13. SECURITY TESTS
  static runSecurityTests() {
    console.log('\n--- [13. SECURITY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockSecurity.denyAll();
    const service = freshService();

    try {
      service.registerCitizen({ id: '3273019999999999', familyId: 'f', fullName: 'Hacker', birthDate: '1990-01-01', gender: 'L', religion: 'X' });
      assert(false, 'Security: unauthorized citizen registration should be blocked');
    } catch (e) {
      assert(e.message.includes('Permission denied'), 'Security: unauthorized citizen registration blocked');
    }

    try {
      service.registerFamily({ id: '3273000000006666', regionId: 'r', address: 'Jl. Hack' });
      assert(false, 'Security: unauthorized family registration should be blocked');
    } catch (e) {
      assert(e.message.includes('Permission denied'), 'Security: unauthorized family registration blocked');
    }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // 14. PRIVACY TESTS
  static runPrivacyTests() {
    console.log('\n--- [14. PRIVACY TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    // NIK masking
    const cit = new Citizen({ id: '3273010101900001', familyId: 'f1', fullName: 'Budi', gender: 'L', religion: 'ISLAM', birthDate: '1990-01-01' });
    const citDisplay = cit.toDisplay();
    assert(citDisplay.id === '************0001', 'Privacy: Citizen.toDisplay() masks 12 leading digits of NIK');
    assert(citDisplay.deletedAt === undefined, 'Privacy: Citizen.toDisplay() omits deletedAt');
    assert(citDisplay.deletedBy === undefined, 'Privacy: Citizen.toDisplay() omits deletedBy');

    // KK masking
    const fam = new Family({ id: '3273000000001234', regionId: 'r1', address: 'Jl. Privasi 1' });
    const famDisplay = fam.toDisplay();
    assert(famDisplay.id === '************1234', 'Privacy: Family.toDisplay() masks 12 leading digits of KK');
    assert(famDisplay.deletedAt === undefined, 'Privacy: Family.toDisplay() omits deletedAt');
    assert(famDisplay.deletedBy === undefined, 'Privacy: Family.toDisplay() omits deletedBy');

    // Raw NIK not leaking through stats
    mockDb.createTable('citizens', {});
    mockDb.createTable('families', {});
    const repo = freshRepo();
    repo.createCitizen(new Citizen({ id: '3273010303900003', familyId: 'f1', fullName: 'Rahasia', gender: 'P', religion: 'ISLAM', birthDate: '1990-03-03' }));
    const stats = new CitizenStatistics(repo);
    if (mockCaches.has('citizen_stats')) mockCaches.get('citizen_stats').store = {};
    const recent = stats.getRecentRegistrations(1);
    assert(recent.length === 1, 'Privacy: getRecentRegistrations returns records');
    assert(recent[0].id !== '3273010303900003', 'Privacy: Raw NIK not exposed in getRecentRegistrations (masked)');
    assert(recent[0].id === '************0003', 'Privacy: NIK in recent registrations is masked correctly');

    return tests.every(Boolean);
  }

  // 15. PERFORMANCE TESTS
  static runPerformanceTests() {
    console.log('\n--- [15. PERFORMANCE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('citizens', {});
    mockDb.createTable('families', {});
    const repo = freshRepo();
    if (mockCaches.has('citizen_stats')) mockCaches.get('citizen_stats').store = {};

    const stats = new CitizenStatistics(repo);

    const start = Date.now();
    const sum1 = stats.getSummary();
    const sum2 = stats.getSummary(); // Should hit cache
    const elapsed = Date.now() - start;

    assert(sum1.totalCitizens === sum2.totalCitizens, 'Performance: Cached summary returns identical data');
    assert(elapsed < 50, 'Performance: Cache retrieval is fast (< 50ms)');

    return tests.every(Boolean);
  }

  // 16. REGRESSION TESTS
  static runRegressionTests() {
    console.log('\n--- [16. REGRESSION TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    assert(typeof Citizen.fromObject === 'function', 'Regression: Citizen.fromObject is a function');
    assert(typeof Family.fromObject === 'function', 'Regression: Family.fromObject is a function');
    assert(typeof AdministrativeRegion.fromObject === 'function', 'Regression: AdministrativeRegion.fromObject is a function');
    assert(typeof CitizenMigration.migrationVersion === 'function', 'Regression: CitizenMigration.migrationVersion intact');
    assert(typeof CitizenDashboard.getWidgets === 'function', 'Regression: CitizenDashboard.getWidgets intact');
    assert(typeof CitizenSeeder.isSeeded === 'function', 'Regression: CitizenSeeder.isSeeded intact');
    assert(typeof CitizenPermission.getPermissions === 'function', 'Regression: CitizenPermission.getPermissions intact');

    return tests.every(Boolean);
  }

  // 17. ACCEPTANCE TESTS
  static runAcceptanceTests() {
    console.log('\n--- [17. ACCEPTANCE TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    mockDb.createTable('administrative_regions', {});
    mockDb.createTable('families', {});
    mockDb.createTable('citizens', {});
    const service = freshService();

    // Register first citizen
    service.registerCitizen({
      id: '3273010505800055',
      familyId: 'fam-acc-1',
      fullName: 'Warga Pertama',
      birthDate: '1980-05-05',
      gender: 'L',
      religion: 'ISLAM'
    });

    // Attempt duplicate NIK
    try {
      service.registerCitizen({
        id: '3273010505800055', // Same NIK!
        familyId: 'fam-acc-2',
        fullName: 'Warga Palsu',
        birthDate: '1985-05-05',
        gender: 'P',
        religion: 'ISLAM'
      });
      assert(false, 'Acceptance: duplicate NIK must be rejected');
    } catch (e) {
      assert(e.message.includes('already registered'), 'Acceptance: NIK is 100% unique across ecosystem');
    }

    // Duplicate KK test
    service.registerFamily({ id: '3273000000003333', regionId: 'r-acc', address: 'Jl. Unik 1' });
    try {
      service.registerFamily({ id: '3273000000003333', regionId: 'r-acc', address: 'Jl. Unik 2' });
      assert(false, 'Acceptance: duplicate KK must be rejected');
    } catch (e) {
      assert(e.message.includes('already registered'), 'Acceptance: Nomor KK is 100% unique across ecosystem');
    }

    // DECEASED is a terminal state
    service.registerCitizen({
      id: '3273010606800066',
      familyId: 'fam-acc-1',
      fullName: 'Warga Wafat',
      birthDate: '1945-06-06',
      gender: 'L',
      religion: 'ISLAM'
    });
    service.updateResidencyStatus('3273010606800066', 'DECEASED');
    try {
      service.updateResidencyStatus('3273010606800066', 'ACTIVE');
      assert(false, 'Acceptance: DECEASED status cannot transition to ACTIVE');
    } catch (e) {
      assert(true, 'Acceptance: DECEASED is a terminal residency state (no recovery)');
    }

    return tests.every(Boolean);
  }

  // 18. SYNTAX TESTS
  static runSyntaxTests() {
    console.log('\n--- [18. SYNTAX TESTS] ---');
    const tests = [];
    const assert = (cond, msg) => { tests.push(cond); if (cond) console.log(`  ✓ ${msg}`); else console.error(`  ✗ ${msg}`); };

    const files = [
      'CitizenEntity.js', 'CitizenPermission.js', 'CitizenRule.js', 'CitizenValidator.js',
      'CitizenRepository.js', 'CitizenService.js', 'CitizenMigration.js', 'CitizenSeeder.js',
      'CitizenStatistics.js', 'CitizenDashboard.js'
    ];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(PKG_DIR, file), 'utf8');
        assert(content.length > 0, `Syntax check passed for ${file}`);
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
    console.log('  CITIZEN P30.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityDemographics');
    console.log('  Package: Citizen (Epic Demographics / P30)');
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
      console.log('===========================================\n');
      return 0;
    } else {
      console.log('  QUALITY GATE: FAIL - Some tests did not pass.');
      console.log('===========================================\n');
      return 1;
    }
  }
}

if (require.main === module) {
  process.exit(CitizenTest.runAll());
}

module.exports = CitizenTest;

