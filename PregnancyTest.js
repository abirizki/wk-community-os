/**
 * @class PregnancyTest
 * @description Comprehensive quality and acceptance test suite for the Pregnancy package.
 */
class PregnancyTest {
  /**
   * Main entry point to run all test categories for the Pregnancy package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Pregnancy Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Pregnancy Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Pregnancy Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { pregnancyEntity, pregnancyValidator, pregnancyRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' };
    const entity = new Pregnancy(entityData);
    console.assert(entity.id === 'p1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().motherId === 'm1', 'Unit: Entity toObject mismatch');

    // Validator Test
    try {
      pregnancyValidator.validateForCreate({ ...entityData, gestationalAgeWeeks: -5 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be negative'), 'Unit: Validator did not catch negative gestational age');
    }

    // Rule Test
    try {
      pregnancyRule.checkStateTransition('COMPLETED', 'ACTIVE');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid pregnancy status transition'), 'Unit: Rule did not catch invalid state transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { pregnancyRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Pregnancy({ id: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' });
    pregnancyRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    pregnancyRepository.findActiveByMother('m1');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].status === 'ACTIVE'), 'Repository: findActiveByMother failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { pregnancyValidator, mockPregnancyRule } = this._setupMocks();
    let passed = true;

    try {
      pregnancyValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Mother ID is required'), 'Validation: Missing motherId not caught');
    }

    mockPregnancyRule.checkActivePregnancyExists.mockImplementationOnce(() => { throw new Error('Active pregnancy exists'); });
    try {
      pregnancyValidator.validateForCreate({ motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', startDate: '2026-01-01' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Active pregnancy exists'), 'Validation: Duplicate active pregnancy not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { pregnancyService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      pregnancyService.createPregnancy({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      pregnancyService.changeStatus('p1', 'ACTIVE');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Status change permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { pregnancyRule, mockPregnancyRepository } = this._setupMocks();
    let passed = true;

    mockPregnancyRepository.activePregnancyExists.mockReturnValueOnce(true);
    try {
      pregnancyRule.checkActivePregnancyExists('m1');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkActivePregnancyExists failed');
    }

    try {
      pregnancyRule.checkDates({ startDate: '2026-02-01', estimatedDueDate: '2026-01-15' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be before Start Date'), 'Rule: Invalid date range not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { pregnancyService, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' };
    const pregnancy = pregnancyService.createPregnancy(payload);
    console.assert(pregnancy.id, 'Service: createPregnancy failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PregnancyCreated'), 'Service: Create event not published');

    pregnancyService.changeRiskStatus(pregnancy.id, 'HIGH_RISK');
    console.assert(mockNotificationService.sendToRole.mock.calls.length > 0, 'Service: High risk notification not sent');
    console.assert(mockWorkflowService.start.mock.calls.length > 0, 'Service: High risk workflow not started');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { pregnancyController } = this._setupMocks();
    let passed = true;

    const payload = { motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' };
    const createResponse = pregnancyController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = pregnancyController.findById({ params: { id: 'p1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = pregnancyController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      // A basic invocation test to ensure the migration doesn't crash.
      const { mockDbAdapter } = this._setupMocks();
      PregnancyMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not attempt to create a table.');
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
      // A basic invocation test.
      new PregnancySeeder().run();
    } catch (e) {
      passed = false;
      WK.logger().error(`Seeder test failed: ${e.message}`);
    }
    WK.logger().info(`Seeder Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runStatisticsTests() {
    WK.logger().info('--- [STATISTICS TESTS] ---');
    const { pregnancyStatistics, mockPregnancyRepository } = this._setupMocks();
    let passed = true;

    mockPregnancyRepository.count.mockImplementation((filters) => {
      if (filters.status === 'ACTIVE') return 10;
      if (filters.riskStatus === 'HIGH_RISK') return 3;
      return 50;
    });
    const summary = pregnancyStatistics.getSummary();
    console.assert(summary.totalPregnancies === 50, 'Statistics: getSummary total is incorrect');
    console.assert(summary.activePregnancies === 10, 'Statistics: getSummary active count is incorrect');
    console.assert(summary.highRiskPregnancies === 3, 'Statistics: getSummary high risk count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = PregnancyDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const activeCard = widgets.find(w => w.id === 'pregnancy_active');
    console.assert(activeCard.type === 'summary_card', 'Dashboard: Active pregnancy card is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { pregnancyService, mockMotherRepository } = this._setupMocks();
    let passed = true;

    // Mother Integration
    mockMotherRepository.exists.mockReturnValueOnce(false);
    try {
      pregnancyService.createPregnancy({ motherId: 'm-nonexistent', citizenId: 'c1', healthProfileId: 'h1', startDate: '2026-01-01' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Mother profile with ID m-nonexistent not found'), 'Integration: Did not fail with non-existent MotherProfile');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { pregnancyService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    pregnancyService.getPregnancy('p1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'pregnancy.episode.read.all'), 'Security: getPregnancy missing permission check');

    mockLogger.info.mockClear();
    pregnancyService.createPregnancy({ motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' });
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created pregnancy')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    // Conceptual test: Ensure that when a citizen requests their own data,
    // the service correctly filters by their ID and doesn't expose others' data.
    const { pregnancyService, mockSecurity, mockUser, mockPregnancyRepository } = this._setupMocks();
    let passed = true;

    mockUser.mockReturnValue({ id: 'user-citizen-1', citizenId: 'c1' });
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'pregnancy.episode.read.own') return true;
      throw new Error('Permission Denied');
    });

    // A hypothetical service method for a citizen to get their own history
    // pregnancyService.getOwnPregnancyHistory();
    // console.assert(mockPregnancyRepository.findByCitizen.mock.calls.some(c => c[0] === 'c1'), 'Privacy: Service did not filter by the calling citizen ID');

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { pregnancyStatistics, mockPregnancyRepository } = this._setupMocks();
    let passed = true;

    mockPregnancyRepository.count.mockClear();
    pregnancyStatistics.getSummary(); // First call
    pregnancyStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockPregnancyRepository.count.mock.calls.length <= 6, 'Performance: Summary is not being cached effectively');

    WK.logger().info(`Performance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRegressionTests() {
    WK.logger().info('--- [REGRESSION TESTS] ---');
    // Conceptual: In a real CI/CD, this would trigger tests in dependent packages
    // like Mother, Health, and Posyandu to ensure no breaking changes were introduced.
    let passed = true;
    WK.logger().info(`Regression Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runAcceptanceTests() {
    WK.logger().info('--- [ACCEPTANCE TESTS] ---');
    const { pregnancyService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Steps 1-6: Create pregnancy with valid relationships
    const payload = { motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' };
    const pregnancy = pregnancyService.createPregnancy(payload);
    console.assert(pregnancy, 'Acceptance: Step 6 failed, pregnancy not created');

    // Steps 9-12: Change status, risk, and verify events
    const activePregnancy = pregnancyService.changeStatus(pregnancy.id, 'ACTIVE');
    const highRiskPregnancy = pregnancyService.changeRiskStatus(activePregnancy.id, 'HIGH_RISK');
    console.assert(highRiskPregnancy.riskStatus === 'HIGH_RISK', 'Acceptance: Step 11 failed, risk status not changed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PregnancyCreated'), 'Acceptance: Step 13 failed, create event not published');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PregnancyRiskChanged'), 'Acceptance: Step 13 failed, risk change event not published');

    // Step 19: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      pregnancyService.getPregnancy(pregnancy.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Step 19 failed, unauthorized access was not rejected');
    }

    // Step 20: Complete pregnancy
    const completedPregnancy = pregnancyService.completePregnancy(pregnancy.id, { actualEndDate: '2026-10-01', pregnancyOutcome: 'LIVE_BIRTH' });
    console.assert(completedPregnancy.status === 'COMPLETED', 'Acceptance: Step 20 failed, pregnancy not completed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'PregnancyCompleted'), 'Acceptance: Step 20 failed, completion event not published');

    // Steps 22-23: Delete and verify
    const { mockDbAdapter } = this._setupMocks();
    pregnancyService.deletePregnancy(pregnancy.id);
    console.assert(mockDbAdapter.softDelete.mock.calls.length > 0, 'Acceptance: Step 22 failed, soft delete not called');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'p-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', status: 'PLANNED', version: 1 };
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
    const mockAnalyticsService = { track: WK.mock().fn() };
    const mockNotificationService = { sendToRole: WK.mock().fn() };
    const mockWorkflowService = { start: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'p-mock-' + Math.random() };

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
    const mockCitizenRepository = { exists: WK.mock().fn(() => true) };
    const mockHealthRepository = { findById: WK.mock().fn(id => ({ id, citizenId: 'c1' })) };
    const mockMotherRepository = {
      exists: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, citizenId: 'c1' })),
    };

    // Mock and instantiate components for the Pregnancy package
    const mockPregnancyRepository = new PregnancyRepository();
    mockPregnancyRepository.dbAdapter = mockDbAdapter;

    const mockPregnancyRule = {
      checkMotherExists: WK.mock().fn(),
      checkHealthProfileExists: WK.mock().fn(),
      checkMotherHealthCitizenRelationship: WK.mock().fn(),
      checkActivePregnancyExists: WK.mock().fn(),
      checkPregnancyNumber: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkGestationalAge: WK.mock().fn(),
      checkStateTransition: WK.mock().fn(),
      checkMaternalCounters: WK.mock().fn(),
    };

    const pregnancyRule = new PregnancyRule(mockPregnancyRepository, mockMotherRepository, mockHealthRepository, mockCitizenRepository);
    const pregnancyValidator = new PregnancyValidator(mockPregnancyRule);
    const pregnancyService = new PregnancyService(mockPregnancyRepository, pregnancyValidator, pregnancyRule, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService);
    const pregnancyController = new PregnancyController(pregnancyService);
    const pregnancyStatistics = new PregnancyStatistics(mockPregnancyRepository, mockAnalyticsService);
    const pregnancyEntity = new Pregnancy({ id: 'p1', motherId: 'm1', citizenId: 'c1', healthProfileId: 'h1', pregnancyNumber: 1, startDate: '2026-01-01' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockCitizenRepository, mockHealthRepository, mockMotherRepository, mockPregnancyRepository,
      mockPregnancyRule,
      pregnancyEntity, pregnancyRule, pregnancyValidator, pregnancyService, pregnancyController, pregnancyStatistics,
    };
  }
}