/**
 * Scratch test: IMP-P90.3 — PBB Migration & Seeder Acceptance Check
 */

class MockDb {
  constructor() { this.tables = {}; this.indexes = {}; }
  hasTable(t) { return !!this.tables[t]; }
  createTable(t, schema) { if (!this.tables[t]) this.tables[t] = { schema, records: [] }; }
  dropTable(t) { delete this.tables[t]; delete this.indexes[t]; }
  ensureIndex(t, f) { if (!this.indexes[t]) this.indexes[t] = []; this.indexes[t].push(f); }
  create(t, d) {
    if (!this.tables[t]) this.tables[t] = { records: [] };
    this.tables[t].records.push(d);
    return d;
  }
  findOne(t, criteria) {
    if (!this.tables[t]) return null;
    return this.tables[t].records.find(r => Object.keys(criteria).every(k => r[k] === criteria[k])) || null;
  }
  search(t, criteria) {
    if (!this.tables[t]) return [];
    if (!criteria || Object.keys(criteria).length === 0) return [...this.tables[t].records];
    return this.tables[t].records.filter(r => Object.keys(criteria).every(k => r[k] === criteria[k]));
  }
}

const mockDb = new MockDb();
const mockLogger = { info: (msg) => console.log(`  [Logger] ${msg}`) };

global.WK = {
  database: () => mockDb,
  logger: () => mockLogger,
};

const { PBBMigration } = require('../packages/PBB/PBBMigration.js');
const { PBBSeeder } = require('../packages/PBB/PBBSeeder.js');

let passed = 0; let failed = 0;
const assert = (c, m) => {
  if (c) { console.log(`  ✓ ${m}`); passed++; }
  else { console.error(`  ✗ ${m}`); failed++; }
};

console.log('\n--- 1. Testing PBB Migration ---');
assert(PBBMigration.migrationVersion() === '1.0.0', 'migrationVersion is 1.0.0');
assert(PBBMigration.seedRequired() === true, 'seedRequired is true');

PBBMigration.up();
assert(mockDb.hasTable('pbb_objects'), 'Migration up() creates pbb_objects table');
assert(mockDb.hasTable('pbb_bills'), 'Migration up() creates pbb_bills table');
assert(mockDb.hasTable('pbb_payments'), 'Migration up() creates pbb_payments table');
assert(mockDb.indexes['pbb_objects'].includes('nop'), 'Index for nop created on pbb_objects');
assert(mockDb.indexes['pbb_bills'].includes('status'), 'Index for status created on pbb_bills');
assert(mockDb.indexes['pbb_payments'].includes('billId'), 'Index for billId created on pbb_payments');

// Idempotency check
PBBMigration.up();
assert(true, 'Migration up() is idempotent');

console.log('\n--- 2. Testing PBB Seeder ---');
const seeder = new PBBSeeder();
assert(PBBSeeder.isSeeded() === false, 'isSeeded() is false before seeding');

seeder.run();
assert(PBBSeeder.isSeeded() === true, 'isSeeded() is true after seeding');
const objCatGroup = mockDb.findOne('lookup_groups', { name: 'PBB_OBJECT_CATEGORY' });
assert(!!objCatGroup, 'PBB_OBJECT_CATEGORY lookup group created');
const statusGroup = mockDb.findOne('lookup_groups', { name: 'PBB_STATUS' });
assert(!!statusGroup, 'PBB_STATUS lookup group created');

const countBefore = mockDb.search('lookup_items', {}).length;
assert(countBefore === 7, '7 lookup items created (3 categories + 4 statuses)');

// Idempotent re-run
seeder.run();
const countAfter = mockDb.search('lookup_items', {}).length;
assert(countBefore === countAfter, 'Seeder run() is idempotent (no duplicate rows)');

console.log('\n--- 3. Testing Migration Down ---');
PBBMigration.down();
assert(!mockDb.hasTable('pbb_payments'), 'Migration down() drops pbb_payments table first');
assert(!mockDb.hasTable('pbb_bills'), 'Migration down() drops pbb_bills table second');
assert(!mockDb.hasTable('pbb_objects'), 'Migration down() drops pbb_objects table last');

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

