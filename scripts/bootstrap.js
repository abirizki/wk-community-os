/**
 * @file bootstrap.js
 * @description Unified Database Bootstrap Script for WK Community OS.
 * Executes migrations and seeders across all 8 domain modules in dependency order.
 * @environment Hostinger Node.js / Staging / Production
 */

'use strict';

const path = require('path');

// Mock WK Database Engine setup for standalone bootstrap execution
class DatabaseEngine {
  constructor() {
    this.tables = {};
    this.indexes = {};
  }
  hasTable(t) { return !!this.tables[t]; }
  createTable(t, schema) {
    if (!this.tables[t]) {
      this.tables[t] = { schema, records: [] };
    }
  }
  dropTable(t) {
    delete this.tables[t];
    delete this.indexes[t];
  }
  ensureIndex(t, f) {
    if (!this.indexes[t]) this.indexes[t] = [];
    this.indexes[t].push(f);
  }
  create(t, d) {
    if (!this.tables[t]) this.tables[t] = { records: [] };
    this.tables[t].records.push(d);
    return d;
  }
  findOne(t, criteria) {
    if (!this.tables[t]) return null;
    return this.tables[t].records.find(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    ) || null;
  }
  search(t, criteria) {
    if (!this.tables[t]) return [];
    if (!criteria || Object.keys(criteria).length === 0) return [...this.tables[t].records];
    return this.tables[t].records.filter(r =>
      Object.keys(criteria).every(k => r[k] === criteria[k])
    );
  }
}

const db = new DatabaseEngine();
const logger = {
  info: (msg) => console.log(`[BOOTSTRAP LOG] ${msg}`),
  error: (msg) => console.error(`[BOOTSTRAP ERROR] ${msg}`),
};

global.WK = {
  database: () => db,
  logger: (ns) => ({
    info: (msg) => console.log(`[${ns}] ${msg}`),
    error: (msg) => console.error(`[${ns}] ${msg}`),
  }),
};

// ============================================================================
// MODULE IMPORTS (DEPENDENCY ORDER)
// ============================================================================
const ROOT = path.join(__dirname, '..', 'packages');

function loadModule(pkg, file) {
  try {
    return require(path.join(ROOT, pkg, file));
  } catch (e) {
    logger.error(`Failed to load ${pkg}/${file}: ${e.message}`);
    return null;
  }
}

const migrations = [
  { name: 'Demographics (Citizen)', mod: loadModule('Citizen', 'CitizenMigration.js'), key: 'CitizenMigration' },
  { name: 'Governance (Meeting)', mod: loadModule('Meeting', 'MeetingMigration.js'), key: 'MeetingMigration' },
  { name: 'Governance (Decision)', mod: loadModule('Decision', 'DecisionMigration.js'), key: 'DecisionMigration' },
  { name: 'Governance (Regulation)', mod: loadModule('Regulation', 'RegulationMigration.js'), key: 'RegulationMigration' },
  { name: 'Governance (Policy)', mod: loadModule('Policy', 'PolicyMigration.js'), key: 'PolicyMigration' },
  { name: 'Financial (Dues & Auto-Ledger)', mod: loadModule('Financial', 'FinancialMigration.js'), key: 'FinancialMigration' },
  { name: 'Letter Management', mod: loadModule('Letter', 'LetterMigration.js'), key: 'LetterMigration' },
  { name: 'Complaint Lifecycle', mod: loadModule('Complaint', 'ComplaintMigration.js'), key: 'ComplaintMigration' },
  { name: 'Aspiration & Musrenbang', mod: loadModule('Aspiration', 'AspirationMigration.js'), key: 'AspirationMigration' },
  { name: 'Posyandu Community Health', mod: loadModule('Posyandu', 'PosyanduMigration.js'), key: 'PosyanduMigration' },
  { name: 'PBB Tax Management', mod: loadModule('PBB', 'PBBMigration.js'), key: 'PBBMigration' },
];

const seeders = [
  { name: 'Demographics (Citizen)', mod: loadModule('Citizen', 'CitizenSeeder.js'), key: 'CitizenSeeder' },
  { name: 'Governance (Meeting)', mod: loadModule('Meeting', 'MeetingSeeder.js'), key: 'MeetingSeeder' },
  { name: 'Governance (Decision)', mod: loadModule('Decision', 'DecisionSeeder.js'), key: 'DecisionSeeder' },
  { name: 'Governance (Regulation)', mod: loadModule('Regulation', 'RegulationSeeder.js'), key: 'RegulationSeeder' },
  { name: 'Governance (Policy)', mod: loadModule('Policy', 'PolicySeeder.js'), key: 'PolicySeeder' },
  { name: 'Financial (Dues & Auto-Ledger)', mod: loadModule('Financial', 'FinancialSeeder.js'), key: 'FinancialSeeder' },
  { name: 'Letter Management', mod: loadModule('Letter', 'LetterSeeder.js'), key: 'LetterSeeder' },
  { name: 'Complaint Lifecycle', mod: loadModule('Complaint', 'ComplaintSeeder.js'), key: 'ComplaintSeeder' },
  { name: 'Aspiration & Musrenbang', mod: loadModule('Aspiration', 'AspirationSeeder.js'), key: 'AspirationSeeder' },
  { name: 'Posyandu Community Health', mod: loadModule('Posyandu', 'PosyanduSeeder.js'), key: 'PosyanduSeeder' },
  { name: 'PBB Tax Management', mod: loadModule('PBB', 'PBBSeeder.js'), key: 'PBBSeeder' },
];

// ============================================================================
// UNIFIED BOOTSTRAP EXECUTOR
// ============================================================================

async function runBootstrap() {
  console.log('\n======================================================');
  console.log('  WK COMMUNITY OS — UNIFIED DATABASE BOOTSTRAP');
  console.log('======================================================\n');

  // PHASE 1: RUN TABLE MIGRATIONS (DDL)
  logger.info('--- PHASE 1: Executing Table Migrations (DDL) ---');
  for (const item of migrations) {
    if (!item.mod) continue;
    const MigrationClass = item.mod[item.key] || item.mod;
    try {
      if (typeof MigrationClass.up === 'function') {
        MigrationClass.up();
        logger.info(`✓ Migration UP: ${item.name}`);
      }
    } catch (err) {
      logger.error(`✗ Migration Failed: ${item.name} -> ${err.message}`);
      throw err;
    }
  }

  // PHASE 2: RUN DATA SEEDERS (LOOKUP & REFERENCE DATA)
  console.log('\n--- PHASE 2: Executing Reference Data Seeders ---');
  for (const item of seeders) {
    if (!item.mod) continue;
    const SeederClass = item.mod[item.key] || item.mod;
    try {
      const instance = new SeederClass();
      if (typeof instance.run === 'function') {
        instance.run();
        logger.info(`✓ Seeder RUN: ${item.name}`);
      }
    } catch (err) {
      logger.error(`✗ Seeder Failed: ${item.name} -> ${err.message}`);
      throw err;
    }
  }

  console.log('\n======================================================');
  console.log('  UNIFIED DATABASE BOOTSTRAP COMPLETED SUCCESSFULLY');
  console.log('======================================================\n');
}

if (require.main === module) {
  runBootstrap()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Bootstrap aborted with error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runBootstrap };
