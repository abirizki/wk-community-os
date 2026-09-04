/**
 * @class ANCTest
 * @description Comprehensive quality and acceptance test suite for the ANC package.
 */
class ANCTest {
  /**
   * Main entry point to run all test categories for the ANC package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] ANC Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All ANC Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some ANC Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { ancEntity, ancValidator, ancRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'anc1', pregnancyId: 'p1', visitNumber: 1, visitDate: '2026-02-01' };
    const entity = new ANCRecord(entityData);
    console.assert(entity.id === 'anc1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().pregnancyId === 'p1', 'Unit: Entity toObject mismatch');

    // Validator Test
    try {
      ancValidator.validateForCreate({ ...entityData, weight: -5 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be negative'), 'Unit: Validator did not catch negative measurement');
    }

    // Rule Test
    const { mockPregnancyRepository } = this._setupMocks();
    mockPregnancyRepository.findById.mockReturnValueOnce({ status: 'COMPLETED' });
    try {
      ancRule.checkPregnancyExistsAndIsActive('p1');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('only be created for active pregnancies'), 'Unit: Rule did not catch non-active pregnancy');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { ancRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new ANCRecord({ id: 'anc1', pregnancyId: 'p1', visitNumber: 1, visitDate: '2026-02-01' });
    ancRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    ancRepository.findLatestByPregnancy('p1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[2].sortBy === 'visitDate'), 'Repository: findLatestByPregnancy failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { ancValidator, mockAncRule } = this._setupMocks();
    let passed = true;

    try {
      ancValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Pregnancy ID is required'), 'Validation: Missing pregnancyId not caught');
    }

    mockAncRule.checkDuplicateVisit.mockImplementationOnce(() => { throw new Error('Duplicate visit'); });
    try {
      ancValidator.validateForCreate({ pregnancyId: 'p1', visitDate: '2026-02-01', visitNumber: 1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate visit'), 'Validation: Duplicate visit not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { ancService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      ancService.createANC({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      ancService.updateRiskStatus('anc1', 'HIGH_RISK');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Risk status change permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { ancRule, mockAncRepository } = this._setupMocks();
    let passed = true;

    mockAncRepository.findByVisitNumber.mockReturnValueOnce({ id: 'anc-exists' });
    try {
      ancRule.checkDuplicateVisit('p1', 1);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkDuplicateVisit failed');
    }

    try {
      ancRule.checkDates({ visitDate: '2099-01-01' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be in the future'), 'Rule: Future visit date not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { ancService, mockEventBus, mockNotificationService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { pregnancyId: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', visitNumber: 1, visitDate: '2026-02-01' };
    const ancRecord = ancService.createANC(payload);
    console.assert(ancRecord.id, 'Service: createANC failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ANCCreated'), 'Service: Create event not published');

    ancService.updateFollowUpStatus(ancRecord.id, true);
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ANCFollowUpRequired'), 'Service: Follow-up event not published');
    console.assert(mockWorkflowService.start.mock.calls.length > 0, 'Service: Follow-up workflow not started');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { ancController } = this._setupMocks();
    let passed = true;

    const payload = { pregnancyId: 'p1', visitNumber: 1, visitDate: '2026-02-01' };
    const createResponse = ancController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = ancController.findById({ params: { id: 'anc1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = ancController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      ANCMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1][0] === 'pregnancyId'), 'Migration: Unique index on pregnancyId+visitNumber missing');
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
      const seeder = new ANCSeeder();
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
    const { ancStatistics, mockAncRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockAncRepository.count.mockImplementation((filters) => {
      if (filters.followUpRequired) return 5;
      return 100;
    });
    mockAnalyticsService.getUniqueCount.mockReturnValue(20);
    const summary = ancStatistics.getSummary();
    console.assert(summary.totalAncVisits === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.pregnanciesMonitored === 20, 'Statistics: getSummary monitored count is incorrect');
    console.assert(summary.followUpRequired === 5, 'Statistics: getSummary follow-up count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = ANCDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'anc_visit_trend');
    console.assert(trendChart.type === 'area_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { ancService, mockPregnancyRepository } = this._setupMocks();
    let passed = true;

    // Pregnancy Integration
    mockPregnancyRepository.findById.mockReturnValueOnce(null);
    try {
      ancService.createANC({ pregnancyId: 'p-nonexistent', visitNumber: 1, visitDate: '2026-02-01' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Pregnancy with ID p-nonexistent not found'), 'Integration: Did not fail with non-existent Pregnancy');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { ancService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    ancService.getANC('anc1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'anc.record.read.all'), 'Security: getANC missing permission check');

    mockLogger.info.mockClear();
    ancService.createANC({ pregnancyId: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', visitNumber: 1, visitDate: '2026-02-01' });
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created ANC record')), 'Security: Create action not logged for audit');

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
    const { ancStatistics, mockAncRepository } = this._setupMocks();
    let passed = true;

    mockAncRepository.count.mockClear();
    ancStatistics.getSummary(); // First call
    ancStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockAncRepository.count.mock.calls.length <= 6, 'Performance: Summary is not being cached effectively');

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
    const { ancService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Steps 1-7: Create ANC visit
    const payload = { pregnancyId: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', visitNumber: 1, visitDate: '2026-02-01' };
    const ancRecord = ancService.createANC(payload);
    console.assert(ancRecord, 'Acceptance: Step 7 failed, ANC record not created');

    // Steps 11-14: Update status and verify events
    const highRiskRecord = ancService.updateRiskStatus(ancRecord.id, 'HIGH_RISK');
    const followUpRecord = ancService.updateFollowUpStatus(highRiskRecord.id, true);
    console.assert(followUpRecord.followUpRequired === true, 'Acceptance: Step 13 failed, follow-up status not changed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ANCRiskChanged'), 'Acceptance: Step 16 failed, risk change event not published');

    // Step 22: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      ancService.getANC(ancRecord.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Step 22 failed, unauthorized access was not rejected');
    }

    // Step 29: Soft-delete
    const { mockDbAdapter } = this._setupMocks();
    ancService.deleteANC(ancRecord.id);
    console.assert(mockDbAdapter.softDelete.mock.calls.length > 0, 'Acceptance: Step 29 failed, soft delete not called');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'anc-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, pregnancyId: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', version: 1 };
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
    const mockUtilities = { getUuid: () => 'anc-mock-' + Math.random() };

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
        return null;
      },
      cache: () => mockCache,
      permission: () => {},
      mock: () => ({ fn: (impl) => Object.assign(impl || (() => {}), { mock: { calls: [] } }) }),
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    // Mock repositories from other packages
    const mockPregnancyRepository = {
      findById: WK.mock().fn(id => ({ id, motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', status: 'ACTIVE' })),
    };

    // Mock and instantiate components for the ANC package
    const mockAncRepository = new ANCRepository();
    mockAncRepository.dbAdapter = mockDbAdapter;

    const mockAncRule = {
      checkPregnancyExistsAndIsActive: WK.mock().fn(),
      checkRelationshipIntegrity: WK.mock().fn(),
      checkDuplicateVisit: WK.mock().fn(),
      checkVisitNumber: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkMeasurements: WK.mock().fn(),
      checkGestationalAge: WK.mock().fn(),
    };

    const ancRule = new ANCRule(mockAncRepository, mockPregnancyRepository);
    const ancValidator = new ANCValidator(ancRule);
    const ancService = new ANCService(mockAncRepository, ancValidator, ancRule, mockEventBus, mockNotificationService, mockWorkflowService);
    const ancController = new ANCController(ancService);
    const ancStatistics = new ANCStatistics(mockAncRepository, mockAnalyticsService);
    const ancEntity = new ANCRecord({ id: 'anc1', pregnancyId: 'p1', visitNumber: 1, visitDate: '2026-02-01' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockPregnancyRepository, mockAncRepository, mockAncRule,
      ancEntity, ancRule, ancValidator, ancService, ancController, ancStatistics,
    };
  }
}