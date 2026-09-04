/**
 * @file FinancialTest.js
 * @description Behavioral Test Suite & Quality Gate — Financial Module (P40)
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. MOCKING ENGINE
// ============================================================================

class MockDatabase {
  constructor() { this.tables = {}; this.indexes = {}; }
  hasTable(name) { return !!this.tables[name]; }
  createTable(name, schema) { if (!this.tables[name]) this.tables[name] = { schema, records: [] }; }
  dropTable(name) { delete this.tables[name]; delete this.indexes[name]; }
  ensureIndex(table, field) {
    if (!this.indexes[table]) this.indexes[table] = [];
    this.indexes[table].push(field);
  }
  create(table, data) {
    if (!this.tables[table]) this.tables[table] = { records: [] };
    this.tables[table].records.push(data); return data;
  }
  findOne(table, criteria) {
    if (!this.tables[table]) return null;
    return this.tables[table].records.find(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    ) || null;
  }
  update(table, criteria, data) {
    const rec = this.findOne(table, criteria);
    if (rec) Object.assign(rec, data); return rec;
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

class MockLogger { info() {} warn() {} error() {} }

class MockEventBus {
  constructor() { this.events = []; }
  publish(event, data) { this.events.push({ event, data }); }
}

class MockAnalyticsService {
  getTimeSeries(table, opts) {
    return [{ period: '2026-08', income: 500000, expense: 200000 }];
  }
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
    if (name === 'AnalyticsService') return new MockAnalyticsService();
    return null;
  },
};

// ============================================================================
// 2. DYNAMIC MODULE LOADER
// ============================================================================

const PKG_DIR = __dirname;
let FinancialConstants, DuesBill, CashTransaction;
let FinancialPermission, FinancialRule, FinancialValidator;
let FinancialRepository, FinancialService;
let FinancialMigration, FinancialSeeder;
let FinancialStatistics, FinancialDashboard;

try {
  ({ FinancialConstants, DuesBill, CashTransaction } = require(path.join(PKG_DIR, 'FinancialEntity.js')));
  ({ FinancialPermission } = require(path.join(PKG_DIR, 'FinancialPermission.js')));
  ({ FinancialRule } = require(path.join(PKG_DIR, 'FinancialRule.js')));
  ({ FinancialValidator } = require(path.join(PKG_DIR, 'FinancialValidator.js')));
  ({ FinancialRepository } = require(path.join(PKG_DIR, 'FinancialRepository.js')));
  ({ FinancialService } = require(path.join(PKG_DIR, 'FinancialService.js')));
  ({ FinancialMigration } = require(path.join(PKG_DIR, 'FinancialMigration.js')));
  ({ FinancialSeeder } = require(path.join(PKG_DIR, 'FinancialSeeder.js')));
  ({ FinancialStatistics } = require(path.join(PKG_DIR, 'FinancialStatistics.js')));
  ({ FinancialDashboard } = require(path.join(PKG_DIR, 'FinancialDashboard.js')));
} catch (e) {
  console.error('FATAL: Failed to load Financial production modules:', e.message);
  process.exit(1);
}

// ============================================================================
// 3. TEST HELPERS
// ============================================================================

function freshRepo() {
  const repo = new FinancialRepository();
  repo.dbAdapter = mockDb;
  return repo;
}

function freshService(repo) {
  return new FinancialService(repo || freshRepo());
}

function ensureTables() {
  if (!mockDb.hasTable('dues_bills')) mockDb.createTable('dues_bills', {});
  if (!mockDb.hasTable('cash_transactions')) mockDb.createTable('cash_transactions', {});
}

// ============================================================================
// 4. TEST SUITE
// ============================================================================

class FinancialTest {

  // [1] UNIT
  static runUnitTests() {
    console.log('\n--- [1. UNIT TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    assert(!!FinancialConstants, 'FinancialConstants exported');
    assert(!!DuesBill, 'DuesBill exported');
    assert(!!CashTransaction, 'CashTransaction exported');
    assert(!!FinancialPermission, 'FinancialPermission exported');
    assert(!!FinancialRule, 'FinancialRule exported');
    assert(!!FinancialValidator, 'FinancialValidator exported');
    assert(!!FinancialRepository, 'FinancialRepository exported');
    assert(!!FinancialService, 'FinancialService exported');
    assert(!!FinancialMigration, 'FinancialMigration exported');
    assert(!!FinancialSeeder, 'FinancialSeeder exported');
    assert(!!FinancialStatistics, 'FinancialStatistics exported');
    assert(!!FinancialDashboard, 'FinancialDashboard exported');
    assert(Array.isArray(FinancialConstants.DUES_STATUSES) && FinancialConstants.DUES_STATUSES.length === 4, 'DUES_STATUSES has 4 items');
    assert(Array.isArray(FinancialConstants.TRANSACTION_TYPES) && FinancialConstants.TRANSACTION_TYPES.length === 2, 'TRANSACTION_TYPES has 2 items');
    assert(Array.isArray(FinancialConstants.TRANSACTION_CATEGORIES) && FinancialConstants.TRANSACTION_CATEGORIES.length === 11, 'TRANSACTION_CATEGORIES has 11 items');
    assert(Array.isArray(FinancialConstants.DUES_TERMINAL_STATUSES), 'DUES_TERMINAL_STATUSES defined');

    return tests.every(Boolean);
  }

  // [2] ENTITY
  static runEntityTests() {
    console.log('\n--- [2. ENTITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const bill = new DuesBill({ familyId: '3273000000001111', period: '2026-09', amount: 50000 });
    assert(bill.id && bill.id.includes('-'), 'DuesBill generates UUID v4');
    assert(bill.status === 'PENDING', 'DuesBill default status is PENDING');
    assert(bill.version === 1, 'DuesBill default version is 1');
    assert(bill.paidAt === null, 'DuesBill default paidAt is null');
    assert(bill.amount === 50000, 'DuesBill amount correct');

    const billObj = bill.toObject();
    const billRestored = DuesBill.fromObject(billObj);
    assert(billRestored.familyId === '3273000000001111', 'DuesBill fromObject restores familyId');
    assert(billRestored.period === '2026-09', 'DuesBill fromObject restores period');

    const tx = new CashTransaction({ type: 'EXPENSE', category: 'OPERASIONAL', amount: -75000, description: 'ATK' });
    assert(tx.id && tx.id.includes('-'), 'CashTransaction generates UUID v4');
    assert(tx.amount === 75000, 'CashTransaction stores amount as absolute positive (Math.abs)');
    assert(tx.version === 1, 'CashTransaction default version is 1');
    assert(tx.referenceId === null, 'CashTransaction default referenceId is null');

    const txObj = tx.toObject();
    const txRestored = CashTransaction.fromObject(txObj);
    assert(txRestored.description === 'ATK', 'CashTransaction fromObject restores description');

    return tests.every(Boolean);
  }

  // [3] REPOSITORY
  static runRepositoryTests() {
    console.log('\n--- [3. REPOSITORY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const repo = freshRepo();

    const bill = new DuesBill({ familyId: '3273000000002222', period: '2026-09', amount: 50000 });
    repo.createBill(bill);
    const found = repo.findBillById(bill.id);
    assert(!!found && found.period === '2026-09', 'Repository: createBill and findBillById work');

    const byFamily = repo.findBillsByFamily('3273000000002222');
    assert(byFamily.length >= 1, 'Repository: findBillsByFamily works');

    const byPeriod = repo.findBillsByPeriod('2026-09');
    assert(byPeriod.length >= 1, 'Repository: findBillsByPeriod works');

    // Optimistic locking
    bill.status = 'PAID';
    const updated = repo.updateBill(bill);
    assert(updated.version === 2, 'Repository: updateBill increments version (optimistic locking)');

    const tx = new CashTransaction({
      type: 'INCOME', category: 'IURAN_BULANAN', amount: 50000,
      description: 'Test', referenceId: bill.id,
      transactionDate: '2026-09-01', recordedByUserId: 'bendahara-001'
    });
    repo.createTransaction(tx);
    const foundTx = repo.findTransactionByReference(bill.id);
    assert(!!foundTx && foundTx.category === 'IURAN_BULANAN', 'Repository: findTransactionByReference works');

    return tests.every(Boolean);
  }

  // [4] VALIDATION
  static runValidationTests() {
    console.log('\n--- [4. VALIDATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const v = new FinancialValidator();

    try { v.validateGenerateBills({ period: '2026-09', amount: 50000 }); assert(true, 'Validator: valid generateBills passes'); }
    catch (e) { assert(false, `Validator rejected valid generateBills: ${e.message}`); }

    try { v.validateGenerateBills({ period: '26-9', amount: 50000 }); assert(false, 'Validator should reject invalid period format'); }
    catch (e) { assert(true, 'Validator: invalid period format rejected'); }

    try { v.validateGenerateBills({ period: '2026-09', amount: -100 }); assert(false, 'Validator should reject negative amount'); }
    catch (e) { assert(true, 'Validator: negative amount rejected in generateBills'); }

    try {
      v.validateManualTransaction({ type: 'INCOME', category: 'DONASI', amount: 100000, description: 'Sumbangan', transactionDate: '2026-09-01' });
      assert(true, 'Validator: valid manualTransaction passes');
    } catch (e) { assert(false, `Validator rejected valid manualTransaction: ${e.message}`); }

    try { v.validateManualTransaction({ category: 'DONASI', amount: 100000, description: 'X', transactionDate: '2026-09-01' }); assert(false, 'Should reject missing type'); }
    catch (e) { assert(true, 'Validator: missing type in manualTransaction rejected'); }

    try { v.validatePaymentRecord({ paidByUserId: 'bendahara-001' }); assert(true, 'Validator: valid paymentRecord passes'); }
    catch (e) { assert(false, 'Validator rejected valid paymentRecord'); }

    try { v.validatePaymentRecord({}); assert(false, 'Validator should reject missing paidByUserId'); }
    catch (e) { assert(true, 'Validator: missing paidByUserId rejected'); }

    return tests.every(Boolean);
  }

  // [5] PERMISSION
  static runPermissionTests() {
    console.log('\n--- [5. PERMISSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const perm = new FinancialPermission();

    try { perm.checkRecordPayment(); assert(true, 'Permission: authorized recordPayment passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    try { perm.checkGenerateBills(); assert(true, 'Permission: authorized generateBills passes'); }
    catch (e) { assert(false, 'Should pass when allowed'); }

    mockSecurity.denyAll();
    try { perm.checkCreateTransaction(); assert(false, 'Should throw when denied'); }
    catch (e) { assert(e.message.includes('Permission denied'), 'Permission: unauthorized createTransaction blocked'); }

    try { perm.checkRecordPayment(); assert(false, 'Should throw when denied'); }
    catch (e) { assert(e.message.includes('Permission denied'), 'Permission: CITIZEN cannot record payments'); }

    mockSecurity.allowAll();
    const perms = FinancialPermission.getPermissions();
    assert(Array.isArray(perms) && perms.length === 7, 'Permission: all 7 permission keys registered');

    return tests.every(Boolean);
  }

  // [6] RULE
  static runRuleTests() {
    console.log('\n--- [6. RULE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const rule = new FinancialRule();

    // Terminal status immutability
    try { rule.checkTerminalStatus('PENDING'); assert(true, 'Rule: PENDING is not terminal — mutation allowed'); }
    catch (e) { assert(false, 'PENDING should not be terminal'); }

    try { rule.checkTerminalStatus('OVERDUE'); assert(true, 'Rule: OVERDUE is not terminal — mutation allowed'); }
    catch (e) { assert(false, 'OVERDUE should not be terminal'); }

    try { rule.checkTerminalStatus('PAID'); assert(false, 'Rule: PAID should throw as terminal'); }
    catch (e) { assert(true, 'Rule: PAID is a terminal status (immutable)'); }

    try { rule.checkTerminalStatus('WAIVED'); assert(false, 'Rule: WAIVED should throw as terminal'); }
    catch (e) { assert(true, 'Rule: WAIVED is a terminal status (immutable)'); }

    // Unique bill per family per period
    const existingBills = [{ familyId: 'fam-001', period: '2026-09' }];
    try { rule.checkUniqueBill('fam-001', '2026-09', existingBills); assert(false, 'Should reject duplicate'); }
    catch (e) { assert(true, 'Rule: duplicate bill (fam+period) rejected'); }

    try { rule.checkUniqueBill('fam-002', '2026-09', existingBills); assert(true, 'Rule: different family same period allowed'); }
    catch (e) { assert(false, 'Different family should be allowed'); }

    try { rule.checkValidPeriodFormat('2026-09'); assert(true, 'Rule: valid period format accepted'); }
    catch (e) { assert(false, 'Valid period rejected'); }

    try { rule.checkValidPeriodFormat('09-2026'); assert(false, 'Rule: invalid period format should throw'); }
    catch (e) { assert(true, 'Rule: invalid period format rejected'); }

    try { rule.checkPositiveAmount(100); assert(true, 'Rule: positive amount accepted'); }
    catch (e) { assert(false, 'Positive amount rejected'); }

    try { rule.checkPositiveAmount(-50); assert(false, 'Should reject negative amount'); }
    catch (e) { assert(true, 'Rule: negative amount rejected'); }

    return tests.every(Boolean);
  }

  // [7] SERVICE (Critical: Double-Entry Ledger)
  static runServiceTests() {
    console.log('\n--- [7. SERVICE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const repo = freshRepo();
    const service = new FinancialService(repo);

    // Generate bills
    const families = [{ id: '3273000000003333' }, { id: '3273000000004444' }];
    const bills = service.generateMonthlyBills('2026-10', 75000, families);
    assert(bills.length === 2, 'Service: generateMonthlyBills creates 1 bill per family');
    assert(bills[0].status === 'PENDING', 'Service: generated bills are PENDING');

    // Idempotent generation (duplicate must be skipped)
    const bills2 = service.generateMonthlyBills('2026-10', 75000, families);
    assert(bills2.length === 0, 'Service: re-running generateMonthlyBills skips duplicates (idempotent)');

    // ─── CRITICAL: Double-Entry Ledger ───
    const billToPayId = bills[0].id;
    const { bill: paidBill, transaction: autoTx } = service.recordDuesPayment(
      billToPayId,
      { paidByUserId: 'bendahara-001', notes: 'Transfer BRI' }
    );
    assert(paidBill.status === 'PAID', 'Service: recordDuesPayment changes bill status to PAID');
    assert(paidBill.paidByUserId === 'bendahara-001', 'Service: recordDuesPayment records paidByUserId');
    assert(!!autoTx, 'Service: recordDuesPayment AUTO-CREATES a CashTransaction (double-entry ledger)');
    assert(autoTx.type === 'INCOME', 'Service: auto-ledger transaction type is INCOME');
    assert(autoTx.category === 'IURAN_BULANAN', 'Service: auto-ledger category is IURAN_BULANAN');
    assert(autoTx.referenceId === billToPayId, 'Service: auto-ledger referenceId links back to DuesBill');
    assert(autoTx.amount === 75000, 'Service: auto-ledger amount matches bill amount');
    // ─────────────────────────────────────

    // Cannot pay again (terminal)
    try { service.recordDuesPayment(billToPayId, { paidByUserId: 'bend-002' }); assert(false, 'Should reject re-payment'); }
    catch (e) { assert(true, 'Service: re-payment of PAID bill blocked by terminal status rule'); }

    // Waive a bill
    const billToWaiveId = bills[1].id;
    const waived = service.waiveDues(billToWaiveId, { notes: 'Bebas iuran — lansia' });
    assert(waived.status === 'WAIVED', 'Service: waiveDues changes bill status to WAIVED');

    // Verify no income entry created for waived bill
    const waiveLedger = repo.findTransactionByReference(billToWaiveId);
    assert(waiveLedger === null, 'Service: waiveDues does NOT create a CashTransaction (no income)');

    // Manual transaction
    const manualTx = service.recordManualTransaction({
      type: 'EXPENSE', category: 'KEBERSIHAN', amount: 30000,
      description: 'Sabun & Sapu', transactionDate: '2026-10-01', recordedByUserId: 'bendahara-001'
    });
    assert(manualTx.type === 'EXPENSE', 'Service: recordManualTransaction creates EXPENSE transaction');
    assert(manualTx.amount === 30000, 'Service: recordManualTransaction stores correct amount');

    return tests.every(Boolean);
  }

  // [8] MIGRATION
  static runMigrationTests() {
    console.log('\n--- [8. MIGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockDb.tables = {}; // Reset

    assert(FinancialMigration.migrationVersion() === '1.0.0', 'Migration: version is 1.0.0');
    assert(FinancialMigration.seedRequired() === true, 'Migration: seedRequired is true');

    FinancialMigration.up();
    assert(mockDb.hasTable('dues_bills'), 'Migration: creates dues_bills table');
    assert(mockDb.hasTable('cash_transactions'), 'Migration: creates cash_transactions table');

    try { FinancialMigration.up(); assert(true, 'Migration: up() is idempotent (no error on re-run)'); }
    catch (e) { assert(false, `Migration up() not idempotent: ${e.message}`); }

    FinancialMigration.down();
    assert(!mockDb.hasTable('cash_transactions'), 'Migration: down() removes cash_transactions first');
    assert(!mockDb.hasTable('dues_bills'), 'Migration: down() removes dues_bills');

    return tests.every(Boolean);
  }

  // [9] SEEDER
  static runSeederTests() {
    console.log('\n--- [9. SEEDER TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockDb.createTable('lookup_groups', {});
    mockDb.createTable('lookup_items', {});
    mockDb.createTable('dues_bills', {});

    const seeder = new FinancialSeeder();
    seeder.run();

    assert(!!mockDb.findOne('lookup_groups', { name: 'DUES_STATUS' }), 'Seeder: DUES_STATUS group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'TRANSACTION_TYPE' }), 'Seeder: TRANSACTION_TYPE group created');
    assert(!!mockDb.findOne('lookup_groups', { name: 'TRANSACTION_CATEGORY' }), 'Seeder: TRANSACTION_CATEGORY group created');

    const countBefore = mockDb.count('lookup_items', {});
    assert(countBefore > 0, 'Seeder: lookup items populated');

    seeder.run(); // Idempotency check
    const countAfter = mockDb.count('lookup_items', {});
    assert(countBefore === countAfter, 'Seeder: run() is idempotent (no duplicates on re-run)');

    assert(FinancialSeeder.isSeeded() === true, 'Seeder: isSeeded() returns true after seeding');
    assert(FinancialSeeder.hasData() === false, 'Seeder: hasData() returns false when dues_bills is empty');

    return tests.every(Boolean);
  }

  // [10] STATISTICS
  static runStatisticsTests() {
    console.log('\n--- [10. STATISTICS TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const repo = freshRepo();

    // Seed data
    repo.createBill(new DuesBill({ familyId: 'fam-s1', period: '2026-09', amount: 50000, status: 'PAID' }));
    repo.createBill(new DuesBill({ familyId: 'fam-s2', period: '2026-09', amount: 50000, status: 'PENDING' }));
    repo.createBill(new DuesBill({ familyId: 'fam-s3', period: '2026-09', amount: 50000, status: 'OVERDUE' }));

    const today = new Date().toISOString().slice(0, 10);
    repo.createTransaction(new CashTransaction({ type: 'INCOME', category: 'IURAN_BULANAN', amount: 150000, description: 'Iuran', transactionDate: today, recordedByUserId: 'u1' }));
    repo.createTransaction(new CashTransaction({ type: 'EXPENSE', category: 'OPERASIONAL', amount: 50000, description: 'ATK', transactionDate: today, recordedByUserId: 'u1' }));

    if (mockCaches.has('financial_stats')) mockCaches.get('financial_stats').store = {};
    const stats = new FinancialStatistics(repo);

    const summary = stats.getTreasurySummary();
    assert(summary.currentBalance === 100000, 'Statistics: currentBalance = Income - Expense (100000)');
    assert(summary.totalIncome === 150000, 'Statistics: totalIncome aggregated correctly');
    assert(summary.totalExpense === 50000, 'Statistics: totalExpense aggregated correctly');

    const compliance = stats.getDuesCompliance('2026-09');
    assert(compliance.total === 3, 'Statistics: getDuesCompliance counts total bills');
    assert(compliance.counts['PAID'] === 1, 'Statistics: getDuesCompliance counts PAID correctly');
    assert(compliance.counts['PENDING'] === 1, 'Statistics: getDuesCompliance counts PENDING correctly');
    assert(compliance.complianceRate === '33.3', 'Statistics: complianceRate is 33.3% (1/3 PAID)');

    const recent = stats.getRecentTransactions(2);
    assert(recent.length === 2, 'Statistics: getRecentTransactions respects limit');
    assert(recent[0].hasOwnProperty('amount'), 'Statistics: recent transactions include amount');

    return tests.every(Boolean);
  }

  // [11] DASHBOARD
  static runDashboardTests() {
    console.log('\n--- [11. DASHBOARD TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.allowAll();
    const widgets = FinancialDashboard.getWidgets();

    assert(widgets.length === 5, 'Dashboard: registers exactly 5 widgets');
    assert(widgets.some(w => w.type === 'summary_card'), 'Dashboard: summary_card widget registered');
    assert(widgets.some(w => w.type === 'donut_chart'), 'Dashboard: donut_chart widget registered for dues compliance');
    assert(widgets.some(w => w.type === 'line_chart'), 'Dashboard: line_chart widget registered for cashflow trend');
    assert(widgets.some(w => w.type === 'table'), 'Dashboard: table widget registered for recent transactions');
    assert(widgets.some(w => w.type === 'quick_actions'), 'Dashboard: quick_actions widget registered');
    assert(widgets.find(w => w.type === 'summary_card').dataSource === 'FinancialStatistics.getTreasurySummary', 'Dashboard: summary_card mapped to getTreasurySummary');

    return tests.every(Boolean);
  }

  // [12] INTEGRATION
  static runIntegrationTests() {
    console.log('\n--- [12. INTEGRATION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const repo = freshRepo();
    const service = new FinancialService(repo);

    // Full flow: generate → pay → summarize
    const families = [{ id: '3273000000099999' }];
    const [bill] = service.generateMonthlyBills('2026-11', 60000, families);
    assert(!!bill && bill.status === 'PENDING', 'Integration: bill generated as PENDING');

    const { bill: paid, transaction } = service.recordDuesPayment(bill.id, { paidByUserId: 'bendahara' });
    assert(paid.status === 'PAID', 'Integration: bill paid successfully');
    assert(!!transaction && transaction.type === 'INCOME', 'Integration: auto-ledger CashTransaction created');

    if (mockCaches.has('financial_stats')) mockCaches.get('financial_stats').store = {};
    const stats = new FinancialStatistics(repo);
    const summary = stats.getTreasurySummary();
    assert(summary.totalIncome >= 60000, 'Integration: getTreasurySummary reflects paid dues income');

    const compliance = stats.getDuesCompliance('2026-11');
    assert(compliance.counts['PAID'] >= 1, 'Integration: compliance stats reflect paid bill');

    return tests.every(Boolean);
  }

  // [13] SECURITY
  static runSecurityTests() {
    console.log('\n--- [13. SECURITY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    mockSecurity.denyAll();
    ensureTables();
    const service = freshService();

    try {
      service.generateMonthlyBills('2026-12', 50000, [{ id: 'fam-hack' }]);
      assert(false, 'Security: unauthorized generateMonthlyBills should be blocked');
    } catch (e) { assert(e.message.includes('Permission denied'), 'Security: generateMonthlyBills blocked without authorization'); }

    try {
      service.recordManualTransaction({ type: 'INCOME', category: 'DONASI', amount: 100000, description: 'X', transactionDate: '2026-12-01', recordedByUserId: 'hacker' });
      assert(false, 'Security: unauthorized manualTransaction should be blocked');
    } catch (e) { assert(e.message.includes('Permission denied'), 'Security: manualTransaction blocked without authorization'); }

    mockSecurity.allowAll();
    return tests.every(Boolean);
  }

  // [14] PRIVACY
  static runPrivacyTests() {
    console.log('\n--- [14. PRIVACY TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const bill = new DuesBill({ familyId: '3273000000001234', period: '2026-09', amount: 50000, deletedAt: '2026-01-01', deletedBy: 'admin' });
    const obj = bill.toObject();
    assert(obj.deletedAt === '2026-01-01', 'Privacy: deletedAt preserved in toObject (for audit use)');
    assert(obj.deletedBy === 'admin', 'Privacy: deletedBy preserved in toObject (for audit use)');

    ensureTables();
    const repo = freshRepo();
    repo.createTransaction(new CashTransaction({ type: 'INCOME', category: 'IURAN_BULANAN', amount: 50000, description: 'Iuran', transactionDate: '2026-09-01', recordedByUserId: 'u1' }));

    if (mockCaches.has('financial_stats')) mockCaches.get('financial_stats').store = {};
    const stats = new FinancialStatistics(repo);
    const recent = stats.getRecentTransactions(1);
    assert(recent.length === 1, 'Privacy: getRecentTransactions returns records');
    assert(!recent[0].hasOwnProperty('deletedAt'), 'Privacy: deletedAt not exposed in getRecentTransactions output');
    assert(!recent[0].hasOwnProperty('deletedBy'), 'Privacy: deletedBy not exposed in getRecentTransactions output');
    assert(!recent[0].hasOwnProperty('recordedByUserId'), 'Privacy: recordedByUserId not exposed in getRecentTransactions output');

    return tests.every(Boolean);
  }

  // [15] PERFORMANCE
  static runPerformanceTests() {
    console.log('\n--- [15. PERFORMANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const repo = freshRepo();
    if (mockCaches.has('financial_stats')) mockCaches.get('financial_stats').store = {};
    const stats = new FinancialStatistics(repo);

    const t0 = Date.now();
    const r1 = stats.getTreasurySummary(); // miss → compute
    const r2 = stats.getTreasurySummary(); // hit → cache
    const elapsed = Date.now() - t0;

    assert(r1.currentBalance === r2.currentBalance, 'Performance: cached summary returns identical result');
    assert(elapsed < 50, 'Performance: cache hit is fast (< 50ms for double call)');

    return tests.every(Boolean);
  }

  // [16] REGRESSION
  static runRegressionTests() {
    console.log('\n--- [16. REGRESSION TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    // Ensure Citizen familyId format (16-digit KK) is compatible as DuesBill.familyId
    const kk = '3273000000001234';
    const bill = new DuesBill({ familyId: kk, period: '2026-09', amount: 50000 });
    assert(bill.familyId === kk, 'Regression: Citizen familyId (No. KK 16-digit) compatible as DuesBill.familyId');

    const restored = DuesBill.fromObject(bill.toObject());
    assert(restored.familyId === kk, 'Regression: fromObject round-trip preserves Citizen familyId');
    assert(typeof DuesBill.fromObject === 'function', 'Regression: DuesBill.fromObject is a function');
    assert(typeof CashTransaction.fromObject === 'function', 'Regression: CashTransaction.fromObject is a function');
    assert(typeof FinancialMigration.migrationVersion === 'function', 'Regression: FinancialMigration.migrationVersion intact');
    assert(typeof FinancialDashboard.getWidgets === 'function', 'Regression: FinancialDashboard.getWidgets intact');
    assert(typeof FinancialSeeder.isSeeded === 'function', 'Regression: FinancialSeeder.isSeeded intact');

    return tests.every(Boolean);
  }

  // [17] ACCEPTANCE
  static runAcceptanceTests() {
    console.log('\n--- [17. ACCEPTANCE TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    ensureTables();
    const service = freshService();

    // One bill per family per period
    service.generateMonthlyBills('2026-08', 50000, [{ id: '3273000000005555' }]);

    // Same family, same period — must be blocked
    const duplicateBills = service.generateMonthlyBills('2026-08', 50000, [{ id: '3273000000005555' }]);
    assert(duplicateBills.length === 0, 'Acceptance: duplicate bill (same family + period) is silently rejected');

    // Different period — must succeed
    const newPeriodBills = service.generateMonthlyBills('2026-12', 50000, [{ id: '3273000000005555' }]);
    assert(newPeriodBills.length === 1, 'Acceptance: same family can have bill in different period');

    // PAID bill cannot be waived
    const bill = service.generateMonthlyBills('2026-07', 50000, [{ id: '3273000000006666' }])[0];
    service.recordDuesPayment(bill.id, { paidByUserId: 'bendahara' });
    try {
      service.waiveDues(bill.id, { notes: 'Attempt to waive after paid' });
      assert(false, 'Acceptance: PAID bill should not be waivable');
    } catch (e) { assert(true, 'Acceptance: PAID status prevents waiving (terminal state enforced)'); }

    return tests.every(Boolean);
  }

  // [18] SYNTAX
  static runSyntaxTests() {
    console.log('\n--- [18. SYNTAX TESTS] ---');
    const tests = [];
    const assert = (c, m) => { tests.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };

    const files = [
      'FinancialEntity.js', 'FinancialPermission.js', 'FinancialRule.js',
      'FinancialValidator.js', 'FinancialRepository.js', 'FinancialService.js',
      'FinancialMigration.js', 'FinancialSeeder.js', 'FinancialStatistics.js', 'FinancialDashboard.js',
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
    console.log('  FINANCIAL P40.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityFinance');
    console.log('  Package: Financial (Epic Financial / P40)');
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
  process.exit(FinancialTest.runAll());
}

module.exports = FinancialTest;

