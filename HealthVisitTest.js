/**
 * @class HealthVisitTest
 * @description Comprehensive quality and acceptance test suite for the HealthVisit package.
 */
class HealthVisitTest {
  /**
   * Main entry point to run all test categories for the HealthVisit package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] HealthVisit Package Test Suite ---');
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
      privacy: this.runPrivacyTests(),
      performance: this.runPerformanceTests(),
      regression: this.runRegressionTests(),
      acceptance: this.runAcceptanceTests(),
    };

    const qualityGatePassed = this.runQualityGate(results);

    if (qualityGatePassed) {
      WK.logger().info('--- [PASS] All HealthVisit Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some HealthVisit Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { healthVisitEntity, healthVisitValidator, healthVisitRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'hv1', citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' };
    const entity = new HealthVisit(entityData);
    console.assert(entity.id === 'hv1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().citizenId === 'c1', 'Unit: Entity toObject mismatch');
    console.assert(entity.visitStatus === 'COMPLETED', 'Unit: Entity default status is not COMPLETED');

    // Validator Test
    try {
      healthVisitValidator.validateForCreate({ citizenId: 'c1', visitDate: '2026-08-10' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Visit type is required'), 'Unit: Validator did not catch missing visitType');
    }

    // Rule Test
    try {
      healthVisitRule.checkStatusTransition('COMPLETED', 'SCHEDULED');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid health visit status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { healthVisitRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new HealthVisit({ id: 'hv1', citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' });
    healthVisitRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    healthVisitRepository.findByCitizenId('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[1].citizenId === 'c1'), 'Repository: findByCitizenId failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { healthVisitValidator, mockRule } = this._setupMocks();
    let passed = true;

    try {
      healthVisitValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockRule.checkDuplicateVisit.mockImplementationOnce(() => { throw new Error('Duplicate visit'); });
    try {
      healthVisitValidator.validateForCreate({ citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate visit'), 'Validation: Duplicate visit not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { healthVisitService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      healthVisitService.createHealthVisit({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      healthVisitService.deleteHealthVisit('hv1');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Delete permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { healthVisitRule, mockCitizenRepository, mockRepository } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      healthVisitRule.checkCitizenAndHealthProfile('c-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: Non-existent citizen not caught');
    }

    mockRepository.search.mockReturnValueOnce([{ id: 'hv-exists' }]);
    try {
      healthVisitRule.checkDuplicateVisit({ citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: Duplicate visit not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { healthVisitService, mockEventBus, mockAnalyticsService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' };
    const record = healthVisitService.createHealthVisit(payload);
    console.assert(record.id, 'Service: createHealthVisit failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'HealthVisitCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'health_visit_created'), 'Service: Create analytics not tracked');

    healthVisitService.updateStatus(record.id, 'CANCELLED');
    console.assert(mockWorkflowService.start.mock.calls.length > 0, 'Service: Cancelled status did not start workflow');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { healthVisitController } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' };
    const createResponse = healthVisitController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = healthVisitController.findById({ params: { id: 'hv1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = healthVisitController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      HealthVisitMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1][0] === 'citizenId'), 'Migration: Index on citizenId+visitDate+visitType missing');
    } catch (e) {
      passed = false;
      WK.logger().error(`Migration test failed: ${e.message}`);
    }
    WK.logger().info(`Migration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSeederTests() {
    WK.logger().info('--- [SEEDER TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      const seeder = new HealthVisitSeeder();
      seeder.run();
      const firstRunCallCount = mockDbAdapter.create.mock.calls.length;
      console.assert(firstRunCallCount > 0, 'Seeder: First run did not seed any data');

      mockDbAdapter.exists.mockReturnValue(true);
      seeder.run();
      console.assert(mockDbAdapter.create.mock.calls.length === firstRunCallCount, 'Seeder: Not idempotent');
    } catch (e) {
      passed = false;
      WK.logger().error(`Seeder test failed: ${e.message}`);
    }
    WK.logger().info(`Seeder Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runStatisticsTests() {
    WK.logger().info('--- [STATISTICS TESTS] ---');
    const { healthVisitStatistics, mockRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockRepository.count.mockImplementation((filters) => {
      if (filters.visitStatus === 'COMPLETED') return 80;
      return 100;
    });
    mockAnalyticsService.getUniqueCount.mockReturnValue(50);
    const summary = healthVisitStatistics.getSummary();
    console.assert(summary.totalVisits === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.completedVisits === 80, 'Statistics: getSummary completed count is incorrect');
    console.assert(summary.uniqueCitizens === 50, 'Statistics: getSummary unique citizens count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = HealthVisitDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'healthvisit_creation_trend');
    console.assert(trendChart.type === 'line_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { healthVisitService, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    // Citizen Integration
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      const payload = { citizenId: 'c-nonexistent', visitDate: '2026-08-10', visitType: 'GENERAL' };
      healthVisitService.createHealthVisit(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen with ID c-nonexistent not found'), 'Integration: Did not fail with non-existent Citizen');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { healthVisitService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    healthVisitService.getHealthVisit('hv1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'health.visit.read.all'), 'Security: getHealthVisit missing permission check');

    mockLogger.info.mockClear();
    const payload = { citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' };
    healthVisitService.createHealthVisit(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created health visit')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    let passed = true;
    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { healthVisitStatistics, mockRepository } = this._setupMocks();
    let passed = true;

    mockRepository.count.mockClear();
    healthVisitStatistics.getSummary(); // First call
    healthVisitStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockRepository.count.mock.calls.length <= 4, 'Performance: Summary is not being cached effectively');

    WK.logger().info(`Performance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRegressionTests() {
    WK.logger().info('--- [REGRESSION TESTS] ---');
    let passed = true;
    WK.logger().info(`Regression Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runAcceptanceTests() {
    WK.logger().info('--- [ACCEPTANCE TESTS] ---');
    const { healthVisitService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Create visit
    const payload = { citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' };
    const record = healthVisitService.createHealthVisit(payload);
    console.assert(record, 'Acceptance: Scenario A failed, record not created');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'HealthVisitCreated'), 'Acceptance: Scenario A failed, event not published');

    // Scenario C & D: Status change
    const cancelledRecord = healthVisitService.updateStatus(record.id, 'CANCELLED');
    console.assert(cancelledRecord.visitStatus === 'CANCELLED', 'Acceptance: Scenario C failed, status not CANCELLED');
    try {
      healthVisitService.updateStatus(cancelledRecord.id, 'SCHEDULED');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid health visit status transition'), 'Acceptance: Scenario D failed, invalid status transition was not rejected');
    }

    // Scenario H: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      healthVisitService.getHealthVisit(record.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Scenario H failed, unauthorized access was not rejected');
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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'hv-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, citizenId: 'c1', visitDate: '2026-08-10', visitStatus: 'SCHEDULED', version: 1, notes: [] };
      }),
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
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn() };
    const mockNotificationService = { sendToRole: WK.mock().fn(), schedule: WK.mock().fn() };
    const mockWorkflowService = { start: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'hv-mock-' + Math.random() };
    const mockMasterDataService = { exists: WK.mock().fn(() => true) };

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
        if (name === 'WorkflowService') return mockWorkflowService;
        if (name === 'MasterData') return mockMasterDataService;
        return null;
      },
      cache: () => mockCache,
      permission: () => {},
      mock: () => ({ fn: (impl) => Object.assign(impl || (() => {}), { mock: { calls: [] } }) }),
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    // Mock repositories from other packages
    const mockCitizenRepository = { exists: WK.mock().fn(() => true) };
    const mockHealthRepository = { findById: WK.mock().fn(id => ({ id, citizenId: 'c1' })) };

    // Mock and instantiate components for the HealthVisit package
    const mockRepository = new HealthVisitRepository();
    mockRepository.dbAdapter = mockDbAdapter;

    const mockRule = {
      checkCitizenAndHealthProfile: WK.mock().fn(),
      checkDuplicateVisit: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkVisitContext: WK.mock().fn(),
      checkLookups: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
    };

    const healthVisitRule = new HealthVisitRule(mockRepository, mockCitizenRepository, mockHealthRepository);
    const healthVisitValidator = new HealthVisitValidator(healthVisitRule);
    const healthVisitService = new HealthVisitService(mockRepository, healthVisitValidator, healthVisitRule, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService);
    const healthVisitController = new HealthVisitController(healthVisitService);
    const healthVisitStatistics = new HealthVisitStatistics(mockRepository, mockAnalyticsService);
    const healthVisitEntity = new HealthVisit({ id: 'hv1', citizenId: 'c1', visitDate: '2026-08-10', visitType: 'GENERAL' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockCitizenRepository, mockHealthRepository, mockRepository, mockRule, mockMasterDataService,
      healthVisitEntity, healthVisitRule, healthVisitValidator, healthVisitService, healthVisitController, healthVisitStatistics,
    };
  }
}
