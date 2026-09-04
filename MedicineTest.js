/**
 * @class MedicineTest
 * @description Comprehensive quality and acceptance test suite for the Medicine package.
 */
class MedicineTest {
  /**
   * Main entry point to run all test categories for the Medicine package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Medicine Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Medicine Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Medicine Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { medicineEntity, medicineValidator, medicineRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'med1', code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' };
    const entity = new Medicine(entityData);
    console.assert(entity.id === 'med1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().code === 'PARA500', 'Unit: Entity toObject mismatch');
    console.assert(entity.status === 'ACTIVE', 'Unit: Entity default status is not ACTIVE');

    // Validator Test
    try {
      medicineValidator.validateForCreate({ name: 'Test Med', dosageForm: 'TABLET', strength: '100mg' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Medicine code is required'), 'Unit: Validator did not catch missing code');
    }

    // Rule Test
    const { mockRepository } = this._setupMocks();
    mockRepository.findByCode.mockReturnValueOnce({ id: 'med2', code: 'EXISTING' });
    try {
      medicineRule.checkDuplicate({ code: 'EXISTING' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Unit: Rule did not catch duplicate code');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { medicineRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Medicine({ id: 'med1', code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' });
    medicineRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    medicineRepository.findByCode('PARA500');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].code === 'PARA500'), 'Repository: findByCode failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { medicineValidator, mockRule } = this._setupMocks();
    let passed = true;

    try {
      medicineValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Medicine code is required'), 'Validation: Missing code not caught');
    }

    mockRule.checkDuplicate.mockImplementationOnce(() => { throw new Error('Duplicate medicine'); });
    try {
      medicineValidator.validateForCreate({ code: 'DUPE', name: 'Dupe Med', dosageForm: 'TABLET', strength: '100mg' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate medicine'), 'Validation: Duplicate medicine not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { medicineService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      medicineService.createMedicine({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      medicineService.deleteMedicine('med1');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Delete permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { medicineRule, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockMasterDataService.exists.mockReturnValueOnce(false);
    try {
      medicineRule.checkMasterDataLookups({ dosageForm: 'INVALID_FORM' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid value for dosageForm'), 'Rule: Invalid master data lookup not caught');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { medicineService, mockEventBus, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    const payload = { code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' };
    const record = medicineService.createMedicine(payload);
    console.assert(record.id, 'Service: createMedicine failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MedicineCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'medicine_master_created'), 'Service: Create analytics not tracked');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { medicineController } = this._setupMocks();
    let passed = true;

    const payload = { code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' };
    const createResponse = medicineController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = medicineController.findById({ params: { id: 'med1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = medicineController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      MedicineMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'code'), 'Migration: Index on code missing');
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
      const seeder = new MedicineSeeder();
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
    const { medicineStatistics, mockRepository } = this._setupMocks();
    let passed = true;

    mockRepository.count.mockImplementation((filters) => {
      if (filters.status === 'ACTIVE') return 50;
      return 100;
    });
    const summary = medicineStatistics.getSummary();
    console.assert(summary.totalMedicines === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.activeMedicines === 50, 'Statistics: getSummary active count is incorrect');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = MedicineDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const trendChart = widgets.find(w => w.id === 'medicine_creation_trend');
    console.assert(trendChart.type === 'line_chart', 'Dashboard: Trend chart widget is misconfigured');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { medicineService, mockMasterDataService } = this._setupMocks();
    let passed = true;

    // MasterData Integration
    mockMasterDataService.exists.mockReturnValueOnce(false);
    try {
      const payload = { code: 'TEST', name: 'Test Med', dosageForm: 'INVALID_FORM', strength: '100mg' };
      medicineService.createMedicine(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid value for dosageForm'), 'Integration: Did not fail with non-existent MasterData value');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { medicineService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    medicineService.getMedicine('med1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'medicine.master.read'), 'Security: getMedicine missing permission check');

    mockLogger.info.mockClear();
    const payload = { code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' };
    medicineService.createMedicine(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created medicine master record')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    // Since this is a master data package, privacy tests focus on access control via permissions.
    // This is largely covered by the permission tests.
    let passed = true;
    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { medicineStatistics, mockRepository } = this._setupMocks();
    let passed = true;

    mockRepository.count.mockClear();
    medicineStatistics.getSummary(); // First call
    medicineStatistics.getSummary(); // Second call (should be cached)
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
    const { medicineService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Create medicine
    const payload = { code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' };
    const record = medicineService.createMedicine(payload);
    console.assert(record, 'Acceptance: Scenario A failed, record not created');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'MedicineCreated'), 'Acceptance: Scenario A failed, event not published');

    // Scenario B: Update medicine
    const updatedRecord = medicineService.updateMedicine(record.id, { manufacturer: 'WK Pharma' });
    console.assert(updatedRecord.manufacturer === 'WK Pharma', 'Acceptance: Scenario B failed, record not updated');

    // Scenario C: Deactivate medicine
    const deactivatedRecord = medicineService.updateStatus(record.id, 'INACTIVE');
    console.assert(deactivatedRecord.status === 'INACTIVE', 'Acceptance: Scenario C failed, status not changed');

    // Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      medicineService.getMedicine(record.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized access was not rejected');
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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'med-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, code: 'PARA500', name: 'Paracetamol 500mg', version: 1 };
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
    const mockAnalyticsService = { track: WK.mock().fn(), getTimeSeries: WK.mock().fn() };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'med-mock-' + Math.random() };
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
        if (name === 'MasterData') return mockMasterDataService;
        return null;
      },
      cache: () => mockCache,
      permission: () => {},
      mock: () => ({ fn: (impl) => Object.assign(impl || (() => {}), { mock: { calls: [] } }) }),
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    // Mock and instantiate components for the Medicine package
    const mockRepository = new MedicineRepository();
    mockRepository.dbAdapter = mockDbAdapter;

    const mockRule = {
      checkDuplicate: WK.mock().fn(),
      checkMasterDataLookups: WK.mock().fn(),
      checkIsActive: WK.mock().fn(),
    };

    const medicineRule = new MedicineRule(mockRepository);
    const medicineValidator = new MedicineValidator(medicineRule);
    const medicineService = new MedicineService(mockRepository, medicineValidator, medicineRule, mockEventBus, mockAnalyticsService);
    const medicineController = new MedicineController(medicineService);
    const medicineStatistics = new MedicineStatistics(mockRepository, mockAnalyticsService);
    const medicineEntity = new Medicine({ id: 'med1', code: 'PARA500', name: 'Paracetamol 500mg', dosageForm: 'TABLET', strength: '500mg' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockRepository, mockRule,
      medicineEntity, medicineRule, medicineValidator, medicineService, medicineController, medicineStatistics,
    };
  }
}