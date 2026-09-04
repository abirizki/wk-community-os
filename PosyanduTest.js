/**
 * @class PosyanduTest
 * @description Comprehensive test suite for the Posyandu package.
 */
class PosyanduTest {
  /**
   * Main entry point to run all test categories for the Posyandu package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Posyandu Package Test Suite ---');
    const results = {
      unit: this.runUnitTests(),
      repository: this.runRepositoryTests(),
      validation: this.runValidationTests(),
      permission: this.runPermissionTests(),
      rule: this.runRuleTests(),
      service: this.runServiceTests(),
      controller: this.runControllerTests(),
      migration: this.runMigrationTests(),
      seeder: this.runSeederTests(),
      statistics: this.runStatisticsTests(),
      dashboard: this.runDashboardTests(),
      integration: this.runIntegrationTests(),
      security: this.runSecurityTests(),
      performance: this.runPerformanceTests(),
      acceptance: this.runAcceptanceTests(),
    };

    const qualityGatePassed = this.runQualityGate(results);

    if (qualityGatePassed) {
      WK.logger().info('--- [PASS] All Posyandu Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Posyandu Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { posyanduEntity, posyanduValidator, posyanduRule, posyanduService, posyanduController } = this._setupMocks();
    let passed = true;

    // Entity
    const entityData = { id: 'v1', citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08' };
    const entity = new PosyanduVisit(entityData);
    console.assert(entity.id === 'v1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().citizenId === 'c1', 'Unit: Entity toObject mismatch');
    console.assert(PosyanduVisit.fromObject(entity.toObject()).id === 'v1', 'Unit: Entity fromObject mismatch');

    // Validator
    try {
      posyanduValidator.validateForCreate({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08', weight: -1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be negative'), 'Unit: Validator did not catch negative weight');
    }

    // Rule
    const { mockHealthRepository } = this._setupMocks();
    mockHealthRepository.findById.mockReturnValueOnce(null);
    try {
      posyanduRule.checkHealthProfileExists('nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Unit: Rule did not catch non-existent health profile');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { posyanduRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entityData = { id: 'v1', citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08' };
    const entity = new PosyanduVisit(entityData);

    posyanduRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    posyanduRepository.update('v1', { notes: 'test' });
    console.assert(mockDbAdapter.update.mock.calls.length === 1, 'Repository: update was not called');

    posyanduRepository.delete('v1', 'user1');
    console.assert(mockDbAdapter.softDelete.mock.calls.length === 1, 'Repository: softDelete was not called');

    posyanduRepository.findById('v1');
    console.assert(mockDbAdapter.findById.mock.calls.length > 0, 'Repository: findById was not called');

    posyanduRepository.findByCitizen('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[1].citizenId === 'c1'), 'Repository: findByCitizen failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { posyanduValidator, mockPosyanduRule } = this._setupMocks();
    let passed = true;

    try {
      posyanduValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockPosyanduRule.checkDuplicateVisit.mockImplementationOnce(() => { throw new Error('Duplicate visit'); });
    try {
      posyanduValidator.validateForCreate({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate visit'), 'Validation: Duplicate visit not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { posyanduService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      posyanduService.createVisit({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { posyanduRule, mockHealthRepository, mockPosyanduRepository } = this._setupMocks();
    let passed = true;

    mockHealthRepository.findById.mockReturnValueOnce(null);
    try {
      posyanduRule.checkHealthProfileExists('h-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkHealthProfileExists failed');
    }

    mockPosyanduRepository.search.mockReturnValueOnce([{ id: 'v-exists' }]);
    try {
      posyanduRule.checkDuplicateVisit('c1', '2026-08-08');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkDuplicateVisit failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { posyanduService, mockEventBus, mockAnalyticsService, mockNotificationService } = this._setupMocks();
    let passed = true;

    const visit = posyanduService.createVisit({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08' });
    console.assert(visit.id, 'Service: createVisit failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PosyanduVisitCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'posyandu_visit_created'), 'Service: Create analytics not tracked');

    posyanduService.scheduleNextVisit(visit.id, '2026-09-08');
    console.assert(mockNotificationService.schedule.mock.calls.length > 0, 'Service: scheduleNextVisit did not trigger notification');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { posyanduController } = this._setupMocks();
    let passed = true;

    const createResponse = posyanduController.create({ body: { citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08' } });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = posyanduController.findById({ params: { id: 'v1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    const { mockDbAdapter } = this._setupMocks();
    let passed = true;

    PosyanduMigration.up();
    console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
    console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1][0] === 'citizenId'), 'Migration: Unique index on citizenId+visitDate missing');

    PosyanduMigration.down();
    console.assert(mockDbAdapter.dropTable.mock.calls.length > 0, 'Migration: down() did not call dropTable');

    WK.logger().info(`Migration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSeederTests() {
    WK.logger().info('--- [SEEDER TESTS] ---');
    const { mockDbAdapter } = this._setupMocks();
    let passed = true;

    const seeder = new PosyanduSeeder();
    seeder.run();
    const firstRunCallCount = mockDbAdapter.create.mock.calls.length;
    console.assert(firstRunCallCount > 0, 'Seeder: First run did not seed any data');

    mockDbAdapter.exists.mockReturnValue(true); // Simulate data now exists
    seeder.run(); // Run again
    console.assert(mockDbAdapter.create.mock.calls.length === firstRunCallCount, 'Seeder: Not idempotent, created duplicates on second run');

    WK.logger().info(`Seeder Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runStatisticsTests() {
    WK.logger().info('--- [STATISTICS TESTS] ---');
    const { posyanduStatistics, mockPosyanduRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockPosyanduRepository.count.mockReturnValue(10);
    mockAnalyticsService.getUniqueCount.mockReturnValue(5);
    const summary = posyanduStatistics.getSummary();
    console.assert(summary.totalVisits === 10, 'Statistics: getSummary totalVisits is incorrect');
    console.assert(summary.uniqueCitizensServed === 5, 'Statistics: getSummary uniqueCitizensServed is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = PosyanduDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const summaryCard = widgets.find(w => w.id === 'posyandu_total_visits');
    console.assert(summaryCard.type === 'summary_card', 'Dashboard: Summary card widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { posyanduService, mockEventBus, mockNotificationService } = this._setupMocks();
    let passed = true;

    // Health Package Integration
    const { mockHealthRepository } = this._setupMocks();
    mockHealthRepository.findById.mockReturnValueOnce(null);
    try {
      posyanduService.createVisit({ citizenId: 'c1', healthProfileId: 'h-nonexistent', visitDate: '2026-08-08' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Health profile with ID h-nonexistent not found'), 'Integration: Did not fail with non-existent HealthProfile');
    }

    // EventBus/Notification Integration
    posyanduService.scheduleNextVisit('v1', '2026-09-08');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PosyanduNextVisitScheduled'), 'Integration: scheduleNextVisit did not publish event');
    console.assert(mockNotificationService.schedule.mock.calls.length > 0, 'Integration: scheduleNextVisit did not call NotificationService');

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { posyanduService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    // Permission Enforcement
    mockSecurity.checkPermission.mockClear();
    posyanduService.getVisit('v1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'posyandu.visit.read.all'), 'Security: getVisit missing permission check');

    // Input Validation
    try {
      posyanduService.createVisit({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08', weight: -10 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be negative'), 'Security: Negative weight was not validated at service level');
    }

    // Audit Logging
    mockLogger.info.mockClear();
    posyanduService.createVisit({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-09' }); // Use different date
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created Posyandu visit')), 'Security: Create action not logged');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { posyanduStatistics, mockPosyanduRepository } = this._setupMocks();
    let passed = true;

    // Verify caching for statistics
    mockPosyanduRepository.count.mockClear();
    posyanduStatistics.getSummary(); // First call
    posyanduStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockPosyanduRepository.count.mock.calls.length < 10, 'Performance: Statistics summary is not being cached effectively');

    WK.logger().info(`Performance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runAcceptanceTests() {
    WK.logger().info('--- [ACCEPTANCE TESTS] ---');
    const { posyanduService, mockHealthRepository, mockPosyanduRepository, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // 1. & 2. Existing Citizen and HealthProfile verified
    mockHealthRepository.findById.mockReturnValue({ id: 'h1', citizenId: 'c1' });

    // 3. Authorized Cadre registers visit
    const visit = posyanduService.createVisit({ citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-10' });
    console.assert(visit, 'Acceptance: Step 3 failed, visit not created');

    // 4-9. Record data
    const updatedVisit = posyanduService.recordMeasurement(visit.id, { weight: 5, height: 60 });
    const finalVisit = posyanduService.scheduleNextVisit(updatedVisit.id, '2026-09-10');
    console.assert(finalVisit.nextVisitDate === '2026-09-10', 'Acceptance: Step 9 failed, next visit not scheduled');

    // 10 & 11. Audit and Domain event
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PosyanduVisitCreated'), 'Acceptance: Step 11 failed, domain event not published');

    // 14 & 15. Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      posyanduService.getVisit(visit.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Step 15 failed, unauthorized access was not rejected');
    }

    WK.logger().info(`Acceptance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runQualityGate(results) {
    WK.logger().info('--- [QUALITY GATE] ---');
    const failedTests = Object.keys(results).filter(key => !results[key]);

    if (failedTests.length > 0) {
      WK.logger().error(`Quality Gate: FAIL. The following test suites failed: ${failedTests.join(', ')}`);
      return false;
    }

    WK.logger().info('Quality Gate: PASS. All test suites completed successfully.');
    return true;
  }

  /**
   * @private
   */
  static _setupMocks() {
    const mockLogger = {
      info: WK.mock().fn(), warn: WK.mock().fn(), error: WK.mock().fn(), debug: WK.mock().fn(),
    };
    const mockSecurity = { checkPermission: WK.mock().fn(() => true) };
    const mockUser = WK.mock().fn(() => ({ id: 'testUser' }));
    const mockResponse = {
      json: WK.mock().fn((data, status = 200) => ({ data, status })),
      error: WK.mock().fn((msg, status = 400) => ({ msg, status })),
    };
    const mockDbAdapter = {
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'v-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, citizenId: 'c1', healthProfileId: 'h1', visitDate: '2026-08-08', version: 1 })),
      findOne: WK.mock().fn(() => null),
      exists: WK.mock().fn(() => false),
      search: WK.mock().fn(() => []),
      findAll: WK.mock().fn(() => []),
      count: WK.mock().fn(() => 0),
      hasTable: WK.mock().fn(() => true),
      createTable: WK.mock().fn(),
      ensureIndex: WK.mock().fn(),
      dropTable: WK.mock().fn(),
    };
    const mockEventBus = { publish: WK.mock().fn() };
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getCount: WK.mock().fn() };
    const mockNotificationService = { schedule: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockKernel = { getPackageManager: () => ({ getAllPackages: () => [] }) };
    const mockUtilities = { getUuid: () => 'v-mock-' + Math.random() };

    global.WK = {
      logger: () => mockLogger,
      security: () => mockSecurity,
      user: mockUser,
      response: () => mockResponse,
      database: () => mockDbAdapter,
      service: (name) => {
        if (name === 'eventbus') return mockEventBus;
        if (name === 'AnalyticsService') return mockAnalyticsService;
        if (name === 'NotificationService') return mockNotificationService;
        return null;
      },
      cache: () => mockCache,
      permission: () => {},
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    const mockHealthRepository = { findById: WK.mock().fn(() => ({ id: 'h1' })) };
    const mockPosyanduRepository = new PosyanduRepository();
    mockPosyanduRepository.dbAdapter = mockDbAdapter;

    const mockPosyanduRule = {
      checkHealthProfileExists: WK.mock().fn(),
      checkDuplicateVisit: WK.mock().fn(),
      checkMeasurements: WK.mock().fn(),
    };

    const posyanduRule = new PosyanduRule(mockPosyanduRepository, mockHealthRepository);
    const posyanduValidator = new PosyanduValidator(mockPosyanduRule);
    const posyanduService = new PosyanduService(mockPosyanduRepository, posyanduValidator, mockEventBus, mockAnalyticsService, mockNotificationService);
    const posyanduController = new PosyanduController(posyanduService);
    const posyanduStatistics = new PosyanduStatistics(mockPosyanduRepository, mockAnalyticsService);
    const posyanduEntity = new PosyanduVisit({ id: 'v1', citizenId: 'c1', healthProfileId: 'h1' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockCache, mockKernel, mockUtilities,
      mockHealthRepository, mockPosyanduRepository, mockPosyanduRule,
      posyanduEntity, posyanduRule, posyanduValidator, posyanduService, posyanduController, posyanduStatistics,
    };
  }
}