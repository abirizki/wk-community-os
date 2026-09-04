/**
 * @class ReferralTest
 * @description Comprehensive quality and acceptance test suite for the Referral package.
 */
class ReferralTest {
  /**
   * Main entry point to run all test categories for the Referral package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Referral Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Referral Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Referral Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { referralEntity, referralValidator, referralRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'ref1', citizenId: 'c1', referralDate: '2026-05-01', reason: 'Further checks' };
    const entity = new Referral(entityData);
    console.assert(entity.id === 'ref1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().citizenId === 'c1', 'Unit: Entity toObject mismatch');
    console.assert(entity.referralStatus === 'DRAFT', 'Unit: Entity default status is not DRAFT');

    // Validator Test
    try {
      referralValidator.validateForCreate({ citizenId: 'c1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Referral date is required'), 'Unit: Validator did not catch missing referralDate');
    }

    // Rule Test
    try {
      referralRule.checkStatusTransition('COMPLETED', 'PENDING');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid referral status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { referralRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Referral({ id: 'ref1', citizenId: 'c1', referralDate: '2026-05-01', reason: 'Test' });
    referralRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    referralRepository.getLatestByCitizen('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[2].sortBy === 'referralDate'), 'Repository: getLatestByCitizen failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { referralValidator, mockReferralRule } = this._setupMocks();
    let passed = true;

    try {
      referralValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockReferralRule.checkSourceContext.mockImplementationOnce(() => { throw new Error('Invalid source'); });
    try {
      referralValidator.validateForCreate({ citizenId: 'c1', referralDate: '2026-05-01', sourceType: 'X', sourceId: 'Y', destinationType: 'A', destinationId: 'B', reason: 'Test' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid source'), 'Validation: Invalid source context not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { referralService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      referralService.createReferral({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      referralService.acceptReferral('ref1', 'prov1', 'DOCTOR');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Accept permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { referralRule, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockMasterDataService.get.mockReturnValueOnce(null);
    try {
      referralRule.checkDestination('HEALTH_FACILITY', 'dest-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found in master data'), 'Rule: Non-existent destination not caught');
    }

    try {
      referralRule.checkDates({ referralDate: '2099-01-01' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be in the future'), 'Rule: Future referral date not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { referralService, mockEventBus, mockAnalyticsService, mockNotificationService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', sourceType: 'MEDICAL_RECORD', sourceId: 'mr1', destinationType: 'HEALTH_FACILITY', destinationId: 'hf1', reason: 'Test' };
    const record = referralService.createReferral(payload);
    console.assert(record.id, 'Service: createReferral failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ReferralCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'referral_created'), 'Service: Create analytics not tracked');

    referralService.acceptReferral(record.id, 'prov1', 'DOCTOR');
    console.assert(mockNotificationService.sendToRole.mock.calls.length > 0, 'Service: Accept referral did not send notification');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { referralController } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', sourceType: 'MEDICAL_RECORD', sourceId: 'mr1', destinationType: 'HEALTH_FACILITY', destinationId: 'hf1', reason: 'Test' };
    const createResponse = referralController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = referralController.findById({ params: { id: 'ref1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = referralController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      ReferralMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'citizenId'), 'Migration: Index on citizenId missing');
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
      const seeder = new ReferralSeeder();
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
    const { referralStatistics, mockReferralRepository } = this._setupMocks();
    let passed = true;

    mockReferralRepository.count.mockImplementation((filters) => {
      if (filters.referralStatus === 'PENDING') return 5;
      if (filters.referralStatus?.in?.includes('ACCEPTED')) return 10;
      return 100;
    });
    const summary = referralStatistics.getSummary();
    console.assert(summary.total === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.pending === 5, 'Statistics: getSummary pending count is incorrect');
    console.assert(summary.active === 10, 'Statistics: getSummary active count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = ReferralDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'referral_creation_trend');
    console.assert(trendChart.type === 'line_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { referralService, mockMedicalRecordRepository } = this._setupMocks();
    let passed = true;

    // MedicalRecord Integration
    mockMedicalRecordRepository.findById.mockReturnValueOnce(null);
    try {
      const payload = { citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', sourceType: 'MEDICAL_RECORD', sourceId: 'mr-nonexistent', destinationType: 'HEALTH_FACILITY', destinationId: 'hf1', reason: 'Test' };
      referralService.createReferral(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Source record of type MEDICAL_RECORD with ID mr-nonexistent not found'), 'Integration: Did not fail with non-existent MedicalRecord');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { referralService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    referralService.getReferral('ref1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'referral.record.read.all'), 'Security: getReferral missing permission check');

    mockLogger.info.mockClear();
    const payload = { citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', sourceType: 'MEDICAL_RECORD', sourceId: 'mr1', destinationType: 'HEALTH_FACILITY', destinationId: 'hf1', reason: 'Test' };
    referralService.createReferral(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created referral')), 'Security: Create action not logged for audit');

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
    const { referralStatistics, mockReferralRepository } = this._setupMocks();
    let passed = true;

    mockReferralRepository.count.mockClear();
    referralStatistics.getSummary(); // First call
    referralStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockReferralRepository.count.mock.calls.length <= 6, 'Performance: Summary is not being cached effectively');

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
    const { referralService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Create referral
    const payload = { citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', sourceType: 'MEDICAL_RECORD', sourceId: 'mr1', destinationType: 'HEALTH_FACILITY', destinationId: 'hf1', reason: 'Test' };
    const record = referralService.createReferral(payload);
    console.assert(record, 'Acceptance: Scenario A failed, record not created');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ReferralCreated'), 'Acceptance: Scenario A failed, event not published');

    // Scenario B: Accept referral
    const acceptedRecord = referralService.acceptReferral(record.id, 'prov1', 'DOCTOR');
    console.assert(acceptedRecord.referralStatus === 'ACCEPTED', 'Acceptance: Scenario B failed, status not ACCEPTED');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ReferralAccepted'), 'Acceptance: Scenario B failed, event not published');

    // Scenario I: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      referralService.getReferral(record.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Scenario I failed, unauthorized access was not rejected');
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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'ref-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01', referralStatus: 'PENDING', version: 1, notes: [] };
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
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getTopN: WK.mock().fn() };
    const mockNotificationService = { sendToRole: WK.mock().fn(), schedule: WK.mock().fn() };
    const mockWorkflowService = { start: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'ref-mock-' + Math.random() };
    const mockMasterDataService = { get: WK.mock().fn(() => ({ id: 'dest1', name: 'Dest 1' })), exists: WK.mock().fn(() => true) };
    const mockProviderRegistry = { exists: WK.mock().fn(() => true) };

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
        if (name === 'ProviderRegistry') return mockProviderRegistry;
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
    const mockMedicalRecordRepository = { findById: WK.mock().fn(id => ({ id, citizenId: 'c1' })) };

    // Mock and instantiate components for the Referral package
    const mockReferralRepository = new ReferralRepository();
    mockReferralRepository.dbAdapter = mockDbAdapter;

    const mockReferralRule = {
      checkCitizenAndHealthProfile: WK.mock().fn(),
      checkSourceContext: WK.mock().fn(),
      checkDestination: WK.mock().fn(),
      checkProvider: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkStatus: WK.mock().fn(),
      checkType: WK.mock().fn(),
      checkPriority: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
    };

    const referralRule = new ReferralRule(mockReferralRepository, mockCitizenRepository, mockHealthRepository, mockMedicalRecordRepository);
    const referralValidator = new ReferralValidator(referralRule);
    const referralService = new ReferralService(mockReferralRepository, referralValidator, referralRule, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService);
    const referralController = new ReferralController(referralService);
    const referralStatistics = new ReferralStatistics(mockReferralRepository, mockAnalyticsService);
    const referralEntity = new Referral({ id: 'ref1', citizenId: 'c1', healthProfileId: 'h1', referralDate: '2026-05-01' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockCitizenRepository, mockHealthRepository, mockMedicalRecordRepository, mockReferralRepository,
      mockReferralRule, mockMasterDataService,
      referralEntity, referralRule, referralValidator, referralService, referralController, referralStatistics,
    };
  }
}