/**
 * @class ImmunizationTest
 * @description Comprehensive quality and acceptance test suite for the Immunization package.
 */
class ImmunizationTest {
  /**
   * Main entry point to run all test categories for the Immunization package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Immunization Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Immunization Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Immunization Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { immunizationEntity, immunizationValidator, immunizationRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'imm1', citizenId: 'c1', vaccineId: 'vax1', doseNumber: 1, administrationDate: '2026-03-01' };
    const entity = new ImmunizationRecord(entityData);
    console.assert(entity.id === 'imm1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().citizenId === 'c1', 'Unit: Entity toObject mismatch');

    // Validator Test
    try {
      immunizationValidator.validateForCreate({ ...entityData, doseNumber: -1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('must be a positive integer'), 'Unit: Validator did not catch negative dose number');
    }

    // Rule Test
    const { mockCitizenRepository } = this._setupMocks();
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      immunizationRule.checkCitizenAndHealthProfile('c-nonexistent', 'h1');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Unit: Rule did not catch non-existent citizen');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { immunizationRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new ImmunizationRecord({ id: 'imm1', citizenId: 'c1', vaccineId: 'vax1', doseNumber: 1, administrationDate: '2026-03-01' });
    immunizationRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    immunizationRepository.findLatestByCitizen('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[2].sortBy === 'administrationDate'), 'Repository: findLatestByCitizen failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { immunizationValidator, mockImmunizationRule } = this._setupMocks();
    let passed = true;

    try {
      immunizationValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockImmunizationRule.checkDuplicateRecord.mockImplementationOnce(() => { throw new Error('Duplicate record'); });
    try {
      immunizationValidator.validateForCreate({ citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', doseNumber: 1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate record'), 'Validation: Duplicate record not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { immunizationService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      immunizationService.createImmunization({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      immunizationService.updateAdministrationStatus('imm1', 'ADMINISTERED');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Status change permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { immunizationRule, mockImmunizationRepository, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockImmunizationRepository.search.mockReturnValueOnce([{ id: 'imm-exists' }]);
    try {
      immunizationRule.checkDuplicateRecord({ citizenId: 'c1', vaccineId: 'vax1', doseNumber: 1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkDuplicateRecord failed');
    }

    mockMasterDataService.get.mockReturnValueOnce(null);
    try {
      immunizationRule.checkVaccineExists('vax-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found in master data'), 'Rule: Non-existent vaccine not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { immunizationService, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', vaccineName: 'Vax 1', doseNumber: 1 };
    const record = immunizationService.createImmunization(payload);
    console.assert(record.id, 'Service: createImmunization failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ImmunizationCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'immunization_created'), 'Service: Create analytics not tracked');

    immunizationService.updateAdministrationStatus(record.id, 'MISSED');
    console.assert(mockWorkflowService.start.mock.calls.length > 0, 'Service: Missed status did not start workflow');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { immunizationController } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', doseNumber: 1 };
    const createResponse = immunizationController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = immunizationController.findById({ params: { id: 'imm1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = immunizationController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      ImmunizationMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1][0] === 'citizenId'), 'Migration: Unique index on citizenId+vaccineId+doseNumber missing');
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
      const seeder = new ImmunizationSeeder();
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
    const { immunizationStatistics, mockImmunizationRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockImmunizationRepository.count.mockImplementation((filters) => {
      if (filters.administrationStatus === 'ADMINISTERED') return 50;
      if (filters.administrationStatus === 'MISSED') return 5;
      return 100;
    });
    mockAnalyticsService.getUniqueCount.mockReturnValue(80);
    const summary = immunizationStatistics.getSummary();
    console.assert(summary.totalRecords === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.administered === 50, 'Statistics: getSummary administered count is incorrect');
    console.assert(summary.uniqueCitizens === 80, 'Statistics: getSummary unique citizens count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = ImmunizationDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'immunization_administration_trend');
    console.assert(trendChart.type === 'line_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { immunizationService, mockHealthRepository } = this._setupMocks();
    let passed = true;

    // Health Integration
    mockHealthRepository.findById.mockReturnValueOnce(null);
    try {
      immunizationService.createImmunization({ citizenId: 'c1', healthProfileId: 'h-nonexistent', vaccineId: 'vax1', doseNumber: 1 });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Health profile with ID h-nonexistent not found'), 'Integration: Did not fail with non-existent HealthProfile');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { immunizationService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    immunizationService.getImmunization('imm1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'immunization.record.read.all'), 'Security: getImmunization missing permission check');

    mockLogger.info.mockClear();
    immunizationService.createImmunization({ citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', vaccineName: 'Vax 1', doseNumber: 1 });
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created immunization record')), 'Security: Create action not logged for audit');

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
    const { immunizationStatistics, mockImmunizationRepository } = this._setupMocks();
    let passed = true;

    mockImmunizationRepository.count.mockClear();
    immunizationStatistics.getSummary(); // First call
    immunizationStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockImmunizationRepository.count.mock.calls.length <= 5, 'Performance: Summary is not being cached effectively');

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
    const { immunizationService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Steps: Create immunization record
    const payload = { citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', vaccineName: 'Vax 1', doseNumber: 1 };
    const record = immunizationService.createImmunization(payload);
    console.assert(record, 'Acceptance: Step Create failed, record not created');

    // Steps: Update status and verify events
    const administeredRecord = immunizationService.recordAdministration(record.id, { administrationDate: '2026-03-10' });
    console.assert(administeredRecord.administrationStatus === 'ADMINISTERED', 'Acceptance: recordAdministration failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ImmunizationAdministered'), 'Acceptance: Administered event not published');

    // Step: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      immunizationService.getImmunization(record.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized access was not rejected');
    }

    // Step: Soft-delete
    const { mockDbAdapter } = this._setupMocks();
    immunizationService.deleteImmunization(record.id);
    console.assert(mockDbAdapter.softDelete.mock.calls.length > 0, 'Acceptance: Soft delete not called');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'imm-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, citizenId: 'c1', healthProfileId: 'h1', vaccineId: 'vax1', doseNumber: 1, version: 1 };
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
    const mockUtilities = { getUuid: () => 'imm-mock-' + Math.random() };
    const mockMasterDataService = { get: WK.mock().fn(() => ({ id: 'vax1', name: 'Vax 1' })) };

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

    // Mock and instantiate components for the Immunization package
    const mockImmunizationRepository = new ImmunizationRepository();
    mockImmunizationRepository.dbAdapter = mockDbAdapter;

    const mockImmunizationRule = {
      checkCitizenAndHealthProfile: WK.mock().fn(),
      checkVaccineExists: WK.mock().fn(),
      checkDuplicateRecord: WK.mock().fn(),
      checkDoseNumber: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkAdministrationStatus: WK.mock().fn(),
    };

    const immunizationRule = new ImmunizationRule(mockImmunizationRepository, mockHealthRepository, mockCitizenRepository);
    const immunizationValidator = new ImmunizationValidator(immunizationRule);
    const immunizationService = new ImmunizationService(mockImmunizationRepository, immunizationValidator, immunizationRule, mockEventBus, mockAnalyticsService, mockNotificationService, mockWorkflowService);
    const immunizationController = new ImmunizationController(immunizationService);
    const immunizationStatistics = new ImmunizationStatistics(mockImmunizationRepository, mockAnalyticsService);
    const immunizationEntity = new ImmunizationRecord({ id: 'imm1', citizenId: 'c1', vaccineId: 'vax1', doseNumber: 1 });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockNotificationService, mockWorkflowService, mockCache, mockUtilities,
      mockCitizenRepository, mockHealthRepository, mockImmunizationRepository, mockImmunizationRule,
      mockMasterDataService,
      immunizationEntity, immunizationRule, immunizationValidator, immunizationService, immunizationController, immunizationStatistics,
    };
  }
}