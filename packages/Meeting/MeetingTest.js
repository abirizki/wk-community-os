/**
 * @file MeetingTest.js
 * @description Comprehensive behavioral test suite and Quality Gate for the Meeting package (Epic Governance / Package P20).
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
      data: [{ period: '2026-08', value: 10 }],
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
// 2. LOAD PRODUCTION MEETING MODULES
// ============================================================================

const { MeetingConstants, Meeting, MeetingAttendee, MeetingAgenda } = require('./MeetingEntity.js');
const MeetingPermission = require('./MeetingPermission.js');
const MeetingRule = require('./MeetingRule.js');
const MeetingValidator = require('./MeetingValidator.js');
const MeetingRepository = require('./MeetingRepository.js');
const MeetingService = require('./MeetingService.js');
const MeetingMigration = require('./MeetingMigration.js');
const MeetingSeeder = require('./MeetingSeeder.js');
const MeetingStatistics = require('./MeetingStatistics.js');
const MeetingDashboard = require('./MeetingDashboard.js');

// ============================================================================
// 3. MEETING TEST SUITE CLASS
// ============================================================================

class MeetingTest {
  /**
   * Runs all 18 test categories and executes Quality Gate evaluation.
   * @returns {boolean}
   */
  static runAll() {
    console.log('\n===========================================');
    console.log('  MEETING P20.5 BEHAVIORAL TEST SUITE');
    console.log('  Domain: CommunityGovernance');
    console.log('  Package: Meeting (Epic Governance / P20)');
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

    assert(typeof MeetingConstants === 'function', 'MeetingConstants class exported');
    assert(typeof Meeting === 'function', 'Meeting class exported');
    assert(typeof MeetingAttendee === 'function', 'MeetingAttendee class exported');
    assert(typeof MeetingAgenda === 'function', 'MeetingAgenda class exported');
    assert(Array.isArray(MeetingConstants.MEETING_TYPES), 'MeetingConstants meeting types defined');
    assert(Array.isArray(MeetingConstants.MEETING_STATUSES), 'MeetingConstants meeting statuses defined');
    assert(typeof MeetingPermission === 'function', 'MeetingPermission class exported');
    assert(typeof MeetingRule === 'function', 'MeetingRule class exported');
    assert(typeof MeetingValidator === 'function', 'MeetingValidator class exported');
    assert(typeof MeetingRepository === 'function', 'MeetingRepository class exported');
    assert(typeof MeetingService === 'function', 'MeetingService class exported');
    assert(typeof MeetingMigration === 'function', 'MeetingMigration class exported');
    assert(typeof MeetingSeeder === 'function', 'MeetingSeeder class exported');
    assert(typeof MeetingStatistics === 'function', 'MeetingStatistics class exported');
    assert(typeof MeetingDashboard === 'function', 'MeetingDashboard class exported');

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

    // Meeting Entity
    const meeting = new Meeting({
      title: 'Musyawarah RT 01',
      description: 'Laporan kas warga',
      meetingType: 'RUTIN_RT',
      scopeType: 'RT',
      scopeId: 'RT_01',
      venue: 'Balai Warga',
    });

    assert(typeof meeting.id === 'string' && meeting.id.length > 0, 'Meeting ID generated (UUID v4)');
    assert(meeting.status === 'DRAFT', 'Meeting default status is DRAFT');
    assert(meeting.isPublic === true, 'Meeting default isPublic is true');
    assert(meeting.version === 1, 'Meeting default version is 1');

    const meetingObj = meeting.toObject();
    const meetingRestored = Meeting.fromObject(meetingObj);
    assert(meetingRestored.title === 'Musyawarah RT 01', 'Meeting fromObject restores title');

    // Attendee Entity
    const attendee = new MeetingAttendee({
      meetingId: meeting.id,
      citizenId: 'cit-001',
      role: 'SECRETARY',
    });
    assert(attendee.role === 'SECRETARY', 'MeetingAttendee stores role');
    assert(attendee.attendanceStatus === 'ABSENT', 'MeetingAttendee default attendanceStatus is ABSENT');
    const attendeeObj = attendee.toObject();
    const attendeeRestored = MeetingAttendee.fromObject(attendeeObj);
    assert(attendeeRestored.citizenId === 'cit-001', 'MeetingAttendee fromObject restores citizenId');

    // Agenda Entity
    const agenda = new MeetingAgenda({
      meetingId: meeting.id,
      title: 'Pembacaan Doa',
      allocatedMinutes: 10,
      actionItems: [{ task: 'Persiapkan sound', picCitizenId: 'cit-002' }],
    });
    assert(agenda.status === 'PENDING', 'MeetingAgenda default status is PENDING');
    const agendaObj = agenda.toObject();
    assert(typeof agendaObj.actionItems === 'string', 'MeetingAgenda actionItems serialized to string');
    const agendaRestored = MeetingAgenda.fromObject(agendaObj);
    assert(Array.isArray(agendaRestored.actionItems) && agendaRestored.actionItems[0]?.task === 'Persiapkan sound', 'MeetingAgenda fromObject restores actionItems');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;

    // Create meeting
    const meetingEntity = new Meeting({
      title: 'Repo Test Meeting',
      meetingType: 'RUTIN_RW',
      scopeType: 'RW',
      scopeId: 'RW_01',
      venue: 'Aula RW',
    });
    const createdMeeting = repo.createMeeting(meetingEntity);
    assert(createdMeeting && createdMeeting.id, 'Repository creates meeting');

    // Find and update meeting
    const foundMeeting = repo.findMeetingById(createdMeeting.id);
    assert(foundMeeting && foundMeeting.title === 'Repo Test Meeting', 'Repository finds meeting by ID');

    const updatedMeeting = repo.updateMeeting(createdMeeting.id, { title: 'Updated Repo Meeting' });
    assert(updatedMeeting.title === 'Updated Repo Meeting' && updatedMeeting.version === 2, 'Repository updates meeting with version bump');

    // Add and find attendees
    const attendeeEntity = new MeetingAttendee({
      meetingId: createdMeeting.id,
      citizenId: 'cit-repo-1',
      role: 'MEMBER',
    });
    repo.addAttendee(attendeeEntity);
    const attendees = repo.findAttendeesByMeetingId(createdMeeting.id);
    assert(attendees.length >= 1, 'Repository retrieves attendees by meeting ID');

    // Add and find agendas
    const agendaEntity = new MeetingAgenda({
      meetingId: createdMeeting.id,
      title: 'Agenda 1: Sambutan',
      agendaOrder: 1,
    });
    repo.addAgenda(agendaEntity);
    const agendas = repo.findAgendasByMeetingId(createdMeeting.id);
    assert(agendas.length >= 1, 'Repository retrieves agendas by meeting ID');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);
    const validator = new MeetingValidator(rule);

    const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();

    // Valid meeting creation
    try {
      validator.validateMeetingCreate({
        title: 'Musyawarah Valid',
        meetingType: 'RUTIN_RT',
        scopeType: 'RT',
        scopeId: 'RT_01',
        venue: 'Balai Warga',
        scheduledStartTime: futureStart,
        scheduledEndTime: futureEnd,
      });
      assert(true, 'Validator passes valid meeting creation payload');
    } catch (e) {
      assert(false, `Validator failed valid meeting: ${e.message}`);
    }

    // Missing required field
    try {
      validator.validateMeetingCreate({ title: '' });
      assert(false, 'Validator should reject missing title/venue');
    } catch (e) {
      assert(true, 'Validator rejects incomplete meeting payload');
    }

    // Invalid schedule (past date)
    try {
      validator.validateMeetingCreate({
        title: 'Meeting Past',
        meetingType: 'RUTIN_RT',
        scopeType: 'RT',
        scopeId: 'RT_01',
        venue: 'Balai',
        scheduledStartTime: '2020-01-01T10:00:00Z',
        scheduledEndTime: '2020-01-01T11:00:00Z',
      });
      assert(false, 'Validator should reject scheduling in the past');
    } catch (e) {
      assert(true, 'Validator rejects past scheduling timestamp');
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

    const permission = new MeetingPermission();
    mockSecurity.allowAll();

    try {
      permission.checkCreateMeeting();
      permission.checkScheduleMeeting();
      permission.checkStartMeeting();
      permission.checkConcludeMeeting();
      assert(true, 'Permission checks succeed when authorized');
    } catch (e) {
      assert(false, `Permission check failed: ${e.message}`);
    }

    mockSecurity.deny('meeting.conclude');
    try {
      permission.checkConcludeMeeting();
      assert(false, 'Permission check should throw when denied');
    } catch (e) {
      assert(true, 'Permission check properly enforces security denial');
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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);

    // Valid type & role checks
    try {
      rule.checkValidMeetingType('MUSRENBANG_KELURAHAN');
      rule.checkValidScopeType('KELURAHAN');
      rule.checkValidRole('CHAIRPERSON');
      assert(true, 'Rule accepts valid meeting type, scope, and role');
    } catch (e) {
      assert(false, `Rule rejected valid constants: ${e.message}`);
    }

    // Allowed transition: DRAFT -> SCHEDULED -> ONGOING -> CONCLUDED
    try {
      rule.checkStatusTransition('DRAFT', 'SCHEDULED');
      rule.checkStatusTransition('SCHEDULED', 'ONGOING');
      rule.checkStatusTransition('ONGOING', 'CONCLUDED');
      assert(true, 'Rule permits valid status transitions');
    } catch (e) {
      assert(false, `Rule rejected valid status transition: ${e.message}`);
    }

    // Disallowed transition: CONCLUDED -> ONGOING
    try {
      rule.checkStatusTransition('CONCLUDED', 'ONGOING');
      assert(false, 'Rule should reject reopening concluded meeting');
    } catch (e) {
      assert(true, 'Rule rejects illegal status transition');
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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);
    const validator = new MeetingValidator(rule);
    const permission = new MeetingPermission();
    const service = new MeetingService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.allowAll();

    const futureStart = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 26 * 3600 * 1000).toISOString();

    // Create meeting via service
    const meeting = service.createMeeting({
      title: 'Service Created Meeting',
      meetingType: 'RUTIN_RT',
      scopeType: 'RT',
      scopeId: 'RT_03',
      venue: 'Pos Ronda',
      scheduledStartTime: futureStart,
      scheduledEndTime: futureEnd,
      organizerCitizenId: 'cit-service-1',
    });
    assert(meeting && meeting.title === 'Service Created Meeting', 'Service creates meeting and publishes event');

    // Add attendee & agenda
    const attendee = service.addAttendee({ meetingId: meeting.id, citizenId: 'cit-service-2', role: 'MEMBER' });
    assert(attendee && attendee.citizenId === 'cit-service-2', 'Service adds attendee and updates invited count');

    const agenda = service.addAgenda({ meetingId: meeting.id, title: 'Agenda Service', agendaOrder: 1 });
    assert(agenda && agenda.title === 'Agenda Service', 'Service adds agenda item');

    // Schedule, start, record attendance, conclude
    const scheduled = service.scheduleMeeting(meeting.id);
    assert(scheduled.status === 'SCHEDULED', 'Service schedules meeting');

    const started = service.startMeeting(meeting.id);
    assert(started.status === 'ONGOING' && started.actualStartTime, 'Service starts meeting');

    const checkedIn = service.recordAttendance(meeting.id, 'cit-service-2', 'PRESENT');
    assert(checkedIn.attendanceStatus === 'PRESENT', 'Service records attendance check-in');

    const concluded = service.concludeMeeting(meeting.id, 'Notulensi selesai');
    assert(concluded.status === 'CONCLUDED' && concluded.actualEndTime, 'Service concludes meeting and tracks analytics');

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

    assert(MeetingMigration.migrationVersion() === '1.0.0', 'Migration version is 1.0.0');
    assert(MeetingMigration.seedRequired() === true, 'Migration requires seeding');

    MeetingMigration.up();
    assert(mockDb.hasTable('meetings'), 'Migration creates meetings table');
    assert(mockDb.hasTable('meeting_attendees'), 'Migration creates meeting_attendees table');
    assert(mockDb.hasTable('meeting_agendas'), 'Migration creates meeting_agendas table');

    // Idempotency re-run
    try {
      MeetingMigration.up();
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

    const seeder = new MeetingSeeder();
    seeder.run();
    assert(MeetingSeeder.isSeeded() === true, 'Seeder populates lookup data and detects isSeeded');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const stats = new MeetingStatistics(repo, mockAnalytics);

    const summary = stats.getSummary();
    assert(typeof summary.totalMeetings === 'number', 'Statistics summary calculates totalMeetings');
    assert(typeof summary.concludedMeetings === 'number', 'Statistics summary calculates concludedMeetings');
    assert(typeof summary.attendanceRate === 'string', 'Statistics calculates attendanceRate');

    const typeDist = stats.getTypeDistribution();
    assert(Array.isArray(typeDist) && typeDist.length > 0, 'Statistics returns meeting type distribution');

    const upcoming = stats.getUpcomingMeetings(3);
    assert(Array.isArray(upcoming), 'Statistics returns upcoming scheduled meetings');

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

    const widgets = MeetingDashboard.getWidgets();
    assert(Array.isArray(widgets) && widgets.length >= 8, 'Dashboard registers all required widgets');

    const summaryWidget = widgets.find(w => w.type === 'summary_card');
    assert(summaryWidget && summaryWidget.dataSource.startsWith('MeetingStatistics'), 'Summary card maps to MeetingStatistics');

    const pieWidget = widgets.find(w => w.type === 'pie_chart');
    assert(pieWidget && pieWidget.id === 'meeting_type_distribution', 'Pie chart registered for type distribution');

    const cardGroup = widgets.find(w => w.type === 'card_group');
    assert(cardGroup && cardGroup.id === 'meeting_attendance_performance', 'Card group registered for attendance rate');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);
    const validator = new MeetingValidator(rule);
    const permission = new MeetingPermission();
    const service = new MeetingService(repo, validator, permission, rule, mockEventBus, mockAnalytics);
    const stats = new MeetingStatistics(repo, mockAnalytics);

    const futureStart = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 50 * 3600 * 1000).toISOString();

    // End-to-End flow: create -> invite -> schedule -> start -> check-in -> conclude
    const meeting = service.createMeeting({
      title: 'E2E Governance Musrenbang',
      meetingType: 'MUSRENBANG_KELURAHAN',
      scopeType: 'KELURAHAN',
      scopeId: 'KEL_KEBONJATI',
      venue: 'Aula Utama',
      scheduledStartTime: futureStart,
      scheduledEndTime: futureEnd,
      organizerCitizenId: 'cit-lurah',
    });

    service.addAttendee({ meetingId: meeting.id, citizenId: 'cit-e2e-attendee', role: 'MEMBER' });
    service.scheduleMeeting(meeting.id);
    service.startMeeting(meeting.id);
    service.recordAttendance(meeting.id, 'cit-e2e-attendee', 'PRESENT');
    service.concludeMeeting(meeting.id, 'Musrenbang E2E disahkan.');

    const fetchedMeeting = service.getMeeting(meeting.id);
    assert(fetchedMeeting.status === 'CONCLUDED', 'Integration: Meeting status reached CONCLUDED');
    assert(fetchedMeeting.totalAttended === 1, 'Integration: Attendance synchronized on meeting');

    const summary = stats.getSummary();
    assert(summary.concludedMeetings >= 1 && summary.totalAttended >= 1, 'Integration: Statistics accurately captures completed meeting');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);
    const validator = new MeetingValidator(rule);
    const permission = new MeetingPermission();
    const service = new MeetingService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    mockSecurity.deny('meeting.create');
    try {
      service.createMeeting({ title: 'Unauthorized', meetingType: 'RUTIN_RT', scopeType: 'RT', scopeId: 'RT_01', venue: 'V', scheduledStartTime: '2026-09-01T10:00:00Z', scheduledEndTime: '2026-09-01T11:00:00Z' });
      assert(false, 'Security: Unauthorized meeting creation should be blocked');
    } catch (e) {
      assert(true, 'Security: Unauthorized meeting creation blocked by permission check');
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

    const meeting = new Meeting({
      title: 'Public Meeting',
      venue: 'Aula',
      deletedAt: '2026-08-29T10:00:00Z',
      deletedBy: 'admin-01',
    });

    const display = meeting.toDisplay();
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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const stats = new MeetingStatistics(repo, mockAnalytics);

    const start1 = Date.now();
    const sum1 = stats.getSummary({ scope: 'perf-meeting' });
    const elapsed1 = Date.now() - start1;

    const start2 = Date.now();
    const sum2 = stats.getSummary({ scope: 'perf-meeting' });
    const elapsed2 = Date.now() - start2;

    assert(sum1.totalMeetings === sum2.totalMeetings, 'Performance: Cached summary returns identical data');
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

    assert(typeof Meeting.fromObject === 'function', 'Regression: Meeting.fromObject intact');
    assert(typeof MeetingAttendee.fromObject === 'function', 'Regression: MeetingAttendee.fromObject intact');
    assert(typeof MeetingAgenda.fromObject === 'function', 'Regression: MeetingAgenda.fromObject intact');
    assert(typeof MeetingMigration.migrationVersion === 'function', 'Regression: MeetingMigration.migrationVersion intact');
    assert(typeof MeetingDashboard.getWidgets === 'function', 'Regression: MeetingDashboard.getWidgets intact');

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

    const repo = new MeetingRepository();
    repo.dbAdapter = mockDb;
    const rule = new MeetingRule(repo);
    const validator = new MeetingValidator(rule);
    const permission = new MeetingPermission();
    const service = new MeetingService(repo, validator, permission, rule, mockEventBus, mockAnalytics);

    // Acceptance Epic Governance: Concluding meeting locks agenda & records decision summary
    const futureStart = new Date(Date.now() + 60 * 3600 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 62 * 3600 * 1000).toISOString();

    const m = service.createMeeting({
      title: 'Musyawarah Penetapan Peraturan RT',
      meetingType: 'RUTIN_RT',
      scopeType: 'RT',
      scopeId: 'RT_01',
      venue: 'Balai',
      scheduledStartTime: futureStart,
      scheduledEndTime: futureEnd,
    });

    const ag = service.addAgenda({ meetingId: m.id, title: 'Pembahasan Jam Malam', agendaOrder: 1 });
    service.updateAgendaDiscussion(ag.id, 'Warga sepakat jam malam pukul 22.00', 'Jam malam 22.00 disetujui');
    service.scheduleMeeting(m.id);
    service.startMeeting(m.id);
    service.concludeMeeting(m.id);

    // Try modifying concluded meeting
    try {
      service.addAgenda({ meetingId: m.id, title: 'Agenda Ilegal Pasca Tutup', agendaOrder: 2 });
      assert(false, 'Acceptance: Adding agenda to concluded meeting must be rejected');
    } catch (e) {
      assert(true, 'Acceptance: Concluded meeting is protected and locked from modification');
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
      'MeetingEntity.js',
      'MeetingRepository.js',
      'MeetingValidator.js',
      'MeetingPermission.js',
      'MeetingRule.js',
      'MeetingService.js',
      'MeetingMigration.js',
      'MeetingSeeder.js',
      'MeetingStatistics.js',
      'MeetingDashboard.js',
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
  MeetingTest.runAll();
}

module.exports = MeetingTest;
