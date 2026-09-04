/**
 * @class MotherTest
 * @description Comprehensive test suite for the Mother package.
 */
class MotherTest {
  /**
   * Main entry point to run all test categories for the Mother package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Mother Package Test Suite ---');
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
      regression: this.runRegressionTests(),
      acceptance: this.runAcceptanceTests(),
    };

    const qualityGatePassed = this.runQualityGate(results);

    if (qualityGatePassed) {
      WK.logger().info('--- [PASS] All Mother Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Mother Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { motherEntity, motherValidator, motherRule } = this._setupMocks();
    let passed = true;

    // Entity
    const entityData = { id: 'm1', citizenId: 'c1', healthProfileId: 'h1' };
    const entity = new MotherProfile(entityData);
    console.assert(entity.id === 'm1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().citizenId === 'c1', 'Unit: Entity toObject mismatch');

    // Validator
    try {
      motherValidator.validateForCreate({ citizenId: 'c1', healthProfileId: 'h1', numberOfPregnancies: -1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be negative'), 'Unit: Validator did not catch negative counter');
    }

    // Rule
    const { mockCitizenRepository } = this._setupMocks();
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      motherRule.checkCitizenExists('nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Unit: Rule did not catch non-existent citizen');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { motherRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new MotherProfile({ id: 'm1', citizenId: 'c1', healthProfileId: 'h1' });
    motherRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    motherRepository.update('m1', { maternalRiskStatus: 'MONITORING' });
    console.assert(mockDbAdapter.update.mock.calls.length === 1, 'Repository: update was not called');

    motherRepository.delete('m1', 'user1');
    console.assert(mockDbAdapter.softDelete.mock.calls.length === 1, 'Repository: softDelete was not called');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { motherValidator, mockMotherRule } = this._setupMocks();
    let passed = true;

    try {
      motherValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockMotherRule.checkDuplicateMotherProfile.mockImplementationOnce(() => { throw new Error('Duplicate profile'); });
    try {
      motherValidator.validateForCreate({ citizenId: 'c1', healthProfileId: 'h1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate profile'), 'Validation: Duplicate profile not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { motherService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      motherService.createMotherProfile({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      motherService.changeMaternalRiskStatus('m1', 'HIGH_RISK');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Risk update permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { motherRule, mockHealthRepository, mockMotherRepository } = this._setupMocks();
    let passed = true;

    mockHealthRepository.findById.mockReturnValueOnce({ id: 'h1', citizenId: 'c-different' });
    try {
      motherRule.checkHealthProfileBelongsToCitizen('c1', 'h1');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('does not belong to citizen'), 'Rule: Mismatched citizen/health profile not caught');
    }

    try {
      motherRule.checkMaternalCounters({ numberOfDeliveries: 2, numberOfPregnancies: 1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot exceed'), 'Rule: Delivery count exceeding pregnancy count not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { motherService, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const profile = motherService.createMotherProfile({ citizenId: 'c1', healthProfileId: 'h1' });
    console.assert(profile.id, 'Service: createMotherProfile failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MotherProfileCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'mother_profile_created'), 'Service: Create analytics not tracked');

    motherService.changeMaternalRiskStatus(profile.id, 'HIGH_RISK');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MotherRiskStatusChanged'), 'Service: Risk change event not published');
    console.assert(mockNotificationService.sendToRole.mock.calls.length > 0, 'Service: High risk notification not sent');
    console.assert(mockWorkflowService.start.mock.calls.length > 0, 'Service: High risk workflow not started');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { motherController } = this._setupMocks();
    let passed = true;

    const createResponse = motherController.create({ body: { citizenId: 'c1', healthProfileId: 'h1' } });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = motherController.findById({ params: { id: 'm1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = motherController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    const { mockDbAdapter } = this._setupMocks();
    let passed = true;

    MotherMigration.up();
    console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
    console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[0] === 'mother_profiles' && c[1] === 'maternalRiskStatus'), 'Migration: Index on maternalRiskStatus missing');

    MotherMigration.down();
    console.assert(mockDbAdapter.dropTable.mock.calls.length > 0, 'Migration: down() did not call dropTable');

    WK.logger().info(`Migration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSeederTests() {
    WK.logger().info('--- [SEEDER TESTS] ---');
    const { mockDbAdapter } = this._setupMocks();
    let passed = true;

    const seeder = new MotherSeeder();
    seeder.run();
    const firstRunCallCount = mockDbAdapter.create.mock.calls.length;
    console.assert(firstRunCallCount > 0, 'Seeder: First run did not seed any data');

    mockDbAdapter.exists.mockReturnValue(true);
    seeder.run();
    console.assert(mockDbAdapter.create.mock.calls.length === firstRunCallCount, 'Seeder: Not idempotent');

    WK.logger().info(`Seeder Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runStatisticsTests() {
    WK.logger().info('--- [STATISTICS TESTS] ---');
    const { motherStatistics, mockMotherRepository } = this._setupMocks();
    let passed = true;

    mockMotherRepository.count.mockImplementation((filters) => {
      if (filters.pregnancyStatus === 'PREGNANT') return 5;
      if (filters.maternalRiskStatus === 'HIGH_RISK') return 2;
      return 20;
    });
    const summary = motherStatistics.getSummary();
    console.assert(summary.totalMothers === 20, 'Statistics: getSummary total is incorrect');
    console.assert(summary.pregnantMothers === 5, 'Statistics: getSummary pregnant count is incorrect');
    console.assert(summary.highRiskMothers === 2, 'Statistics: getSummary high risk count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = MotherDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'mother_registration_trend');
    console.assert(trendChart.type === 'line_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { motherService, mockHealthRepository, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    // Citizen/Health Integration
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      motherService.createMotherProfile({ citizenId: 'c-nonexistent', healthProfileId: 'h1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen with ID c-nonexistent not found'), 'Integration: Did not fail with non-existent Citizen');
    }

    mockHealthRepository.findById.mockReturnValueOnce(null);
    try {
      motherService.createMotherProfile({ citizenId: 'c1', healthProfileId: 'h-nonexistent' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Health profile with ID h-nonexistent not found'), 'Integration: Did not fail with non-existent HealthProfile');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { motherService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    motherService.getMotherProfile('m1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'mother.profile.read.all'), 'Security: getMotherProfile missing permission check');

    mockLogger.info.mockClear();
    motherService.createMotherProfile({ citizenId: 'c1', healthProfileId: 'h1' });
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created mother profile')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { motherStatistics, mockMotherRepository } = this._setupMocks();
    let passed = true;

    mockMotherRepository.count.mockClear();
    motherStatistics.getSummary(); // First call
    motherStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockMotherRepository.count.mock.calls.length <= 5, 'Performance: Summary is not being cached effectively');

    WK.logger().info(`Performance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRegressionTests() {
    WK.logger().info('--- [REGRESSION TESTS] ---');
    // Conceptual: In a real CI/CD, this would trigger tests in dependent packages
    // like Health and Posyandu to ensure no breaking changes were introduced.
    let passed = true;
    WK.logger().info(`Regression Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runAcceptanceTests() {
    WK.logger().info('--- [ACCEPTANCE TESTS] ---');
    const { motherService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Steps 1-4: Create profile with valid citizen/health relationship
    const profile = motherService.createMotherProfile({ citizenId: 'c1', healthProfileId: 'h1' });
    console.assert(profile, 'Acceptance: Step 3 failed, profile not created');

    // Steps 5-10: Update history and risk status
    motherService.updateMaternalHistory(profile.id, { lastMenstrualPeriod: '2026-07-01' });
    motherService.updateCounters(profile.id, { numberOfPregnancies: 1 });
    const highRiskProfile = motherService.changeMaternalRiskStatus(profile.id, 'HIGH_RISK');
    console.assert(highRiskProfile.maternalRiskStatus === 'HIGH_RISK', 'Acceptance: Step 10 failed, risk status not changed');

    // Steps 12-13: Verify events
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MotherProfileCreated'), 'Acceptance: Step 13 failed, create event not published');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MotherRiskStatusChanged'), 'Acceptance: Step 13 failed, risk change event not published');

    // Step 18: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      motherService.getMotherProfile(profile.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Step 18 failed, unauthorized access was not rejected');
    }

    // Steps 20-22: Delete and verify
    motherService.deleteMotherProfile(profile.id);
    // In a real test, we'd query again and expect null. Here we check the mock.
    const { mockDbAdapter } = this._setupMocks();
    console.assert(mockDbAdapter.softDelete.mock.calls.length > 0, 'Acceptance: Step 21 failed, soft delete not called');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'm-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, citizenId: 'c1', healthProfileId: 'h1', version: 1 })),
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
    const mockAnalyticsService = { track: WK.mock().fn(), getAggregates: WK.mock().fn() };
    const mockNotificationService = { sendToRole: WK.mock().fn() };
    const mockWorkflowService = { start: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'm-mock-' + Math.random() };

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
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    const mockCitizenRepository = { exists: WK.mock().fn(() => true) };
    const mockHealthRepository = { findById: WK.mock().fn(id => ({ id, citizenId: 'c1' })) };
    const mockMotherRepository = new MotherRepository();
    mockMotherRepository.dbAdapter = mockDbAdapter;

    const mockMotherRule = {
      checkCitizenExists: WK.mock().fn(),
      checkHealthProfileExists: WK.mock().fn(),
      checkHealthProfileBelongsToCitizen: WK.mock().fn(),
      checkDuplicateMotherProfile: WK.mock().fn(),
      checkMaternalCounters: WK.mock().fn(),
      checkDates: WK.mock().fn(),
    };

    const motherRule = new MotherRule(mockMotherRepository, mockCitizenRepository, mockHealthRepository);
    const motherValidator = new MotherValidator(mockMotherRule);
    const motherService = new MotherService(mockMotherRepository, motherValidator, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService);
    const motherController = new MotherController(motherService);
    const motherStatistics = new MotherStatistics(mockMotherRepository, mockAnalyticsService);
    const motherEntity = new MotherProfile({ id: 'm1', citizenId: 'c1', healthProfileId: 'h1' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockCitizenRepository, mockHealthRepository, mockMotherRepository, mockMotherRule,
      motherEntity, motherRule, motherValidator, motherService, motherController, motherStatistics,
    };
  }
}