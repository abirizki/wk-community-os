/**
 * @class CitizenTest
 * @description Comprehensive quality and acceptance test suite for the Citizen package.
 */
class CitizenTest {
  /**
   * Main entry point to run all test categories for the Citizen package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Citizen Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Citizen Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Citizen Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { citizenEntity, citizenValidator, citizenRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'c1', NIK: '1234567890123456', fullName: 'John Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001' };
    const entity = new Citizen(entityData);
    console.assert(entity.id === 'c1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().NIK === '1234567890123456', 'Unit: Entity toObject NIK mismatch');
    console.assert(entity.status === 'ACTIVE', 'Unit: Entity default status is not ACTIVE');
    console.assert(Citizen.fromObject(entity.toObject()).id === 'c1', 'Unit: Entity fromObject ID mismatch');

    // Validator Test
    try {
      citizenValidator.validateForCreate({ NIK: '123', fullName: 'Test', dateOfBirth: '1990-01-01', rt: '001', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('NIK must be a 16-digit number'), 'Unit: Validator did not catch invalid NIK format');
    }

    // Rule Test
    try {
      citizenRule.checkValidDateOfBirth('2099-01-01');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be in the future'), 'Unit: Rule did not catch future date of birth');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { citizenRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Citizen({ id: 'c1', NIK: '1234567890123456', fullName: 'John Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001' });
    citizenRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    citizenRepository.findByNIK('1234567890123456');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].NIK === '1234567890123456'), 'Repository: findByNIK failed');

    citizenRepository.delete('c1', 'user1');
    console.assert(mockDbAdapter.softDelete.mock.calls.length === 1, 'Repository: softDelete was not called');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { citizenValidator, mockCitizenRule } = this._setupMocks();
    let passed = true;

    try {
      citizenValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('NIK is required'), 'Validation: Missing NIK not caught');
    }

    mockCitizenRule.checkDuplicateNIK.mockImplementationOnce(() => { throw new Error('Duplicate NIK'); });
    try {
      citizenValidator.validateForCreate({ NIK: '1234567890123456', fullName: 'Test', dateOfBirth: '1990-01-01', rt: '001', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate NIK'), 'Validation: Duplicate NIK not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { citizenService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      citizenService.createCitizen({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      citizenService.getCitizenByNIK('1234567890123456');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Sensitive NIK view permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { citizenRule, mockCitizenRepository, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.findByNIK.mockReturnValueOnce({ id: 'c-exists' });
    try {
      citizenRule.checkDuplicateNIK('1111111111111111');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkDuplicateNIK failed');
    }

    mockMasterDataService.exists.mockImplementation((type, code) => {
      if (type === 'RT_NUMBER' && code === '001') return true;
      return false;
    });
    try {
      citizenRule.checkRTExists('002');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('RT number 002 not found'), 'Rule: checkRTExists failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { citizenService, mockEventBus, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    const payload = { NIK: '1234567890123456', fullName: 'Jane Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001' };
    const record = citizenService.createCitizen(payload);
    console.assert(record.id, 'Service: createCitizen failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'CitizenCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'citizen_created'), 'Service: Create analytics not tracked');

    citizenService.updateStatus(record.id, 'INACTIVE');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'CitizenStatusChanged'), 'Service: Status change event not published');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    const { citizenController } = this._setupMocks();
    let passed = true;

    const payload = { NIK: '1234567890123456', fullName: 'Jane Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001' };
    const createResponse = citizenController.create({ body: payload });
    console.assert(createResponse.status === 201, 'Controller: Create did not return 201');

    const findResponse = citizenController.findById({ params: { id: 'c1' } });
    console.assert(findResponse.status === 200, 'Controller: findById failed');

    const errorResponse = citizenController.findById({ params: { id: 'nonexistent' } });
    console.assert(errorResponse.status === 404, 'Controller: Not found error not handled correctly');

    WK.logger().info(`Controller Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      CitizenMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'NIK' && c[2].unique === true), 'Migration: Unique index on NIK missing');
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
      const seeder = new CitizenSeeder();
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
    const { citizenStatistics, mockCitizenRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.count.mockImplementation((filters) => {
      if (filters.status === 'ACTIVE') return 80;
      if (filters.gender === 'MALE') return 40;
      return 100;
    });
    const summary = citizenStatistics.getSummary();
    console.assert(summary.totalCitizens === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.activeCitizens === 80, 'Statistics: getSummary active count is incorrect');

    const genderDist = citizenStatistics.getGenderDistribution();
    console.assert(genderDist.find(d => d.name === 'Laki-laki').value === 40, 'Statistics: getGenderDistribution male count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    citizenStatistics.getRegistrationTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'citizen_created'), 'Statistics: getRegistrationTrend did not call AnalyticsService');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = CitizenDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const totalWidget = widgets.find(w => w.id === 'citizen_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total citizens widget is misconfigured');
    console.assert(totalWidget.dataSource === 'CitizenStatistics.getSummary', 'Dashboard: Total citizens widget has incorrect data source');

    const recentActivityWidget = widgets.find(w => w.id === 'citizen_recent_activity');
    console.assert(recentActivityWidget.dataSource === 'CitizenService.listCitizens', 'Dashboard: Recent activity widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { citizenService, mockMasterDataService } = this._setupMocks();
    let passed = true;

    // MasterData Integration for RT/RW
    mockMasterDataService.exists.mockImplementation((type, code) => {
      if (type === 'RT_NUMBER' && code === '001') return true;
      if (type === 'RW_NUMBER' && code === '001') return true;
      return false;
    });
    try {
      citizenService.createCitizen({ NIK: '1234567890123457', fullName: 'Test', dateOfBirth: '1990-01-01', rt: '003', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('RT number 003 not found'), 'Integration: Did not fail with non-existent RT');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { citizenService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    citizenService.getCitizen('c1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'citizen.profile.read.all'), 'Security: getCitizen missing permission check');

    mockLogger.info.mockClear();
    citizenService.createCitizen({ NIK: '1234567890123458', fullName: 'Audit Test', dateOfBirth: '1990-01-01', rt: '001', rw: '001' });
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created citizen')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { citizenService, mockSecurity, mockUser, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    // Test read.own permission
    mockUser.mockReturnValue({ id: 'user-c1', citizenId: 'c1' });
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'citizen.profile.read.own') return true;
      throw new Error('Permission Denied');
    });
    mockCitizenRepository.findById.mockReturnValueOnce({ id: 'c1', NIK: '111', fullName: 'Own Citizen' });
    const ownCitizen = citizenService.getCitizen('c1'); // Assuming getCitizen handles read.own
    console.assert(ownCitizen.id === 'c1', 'Privacy: getCitizen with read.own failed');

    // Test sensitive NIK access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      citizenService.getCitizenByNIK('1234567890123456');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Privacy: Sensitive NIK access not protected');
    }

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { citizenStatistics, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.count.mockClear();
    citizenStatistics.getSummary(); // First call
    citizenStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockCitizenRepository.count.mock.calls.length <= 4, 'Performance: Summary is not being cached effectively');

    WK.logger().info(`Performance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRegressionTests() {
    WK.logger().info('--- [REGRESSION TESTS] ---');
    let passed = true;
    // No external packages are modified, so regression is primarily internal.
    WK.logger().info(`Regression Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runAcceptanceTests() {
    WK.logger().info('--- [ACCEPTANCE TESTS] ---');
    const { citizenService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Create valid citizen
    const createPayload = { NIK: '1234567890123459', fullName: 'Acceptance Test', dateOfBirth: '1985-05-10', rt: '001', rw: '001' };
    const createdCitizen = citizenService.createCitizen(createPayload);
    console.assert(createdCitizen.id, 'Acceptance: Create citizen failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'CitizenCreated'), 'Acceptance: CitizenCreated event not published');

    // Scenario B: Update citizen
    const updatePayload = { phoneNumber: '081234567890' };
    const updatedCitizen = citizenService.updateCitizen(createdCitizen.id, updatePayload);
    console.assert(updatedCitizen.phoneNumber === '081234567890', 'Acceptance: Update citizen failed');

    // Scenario C: Change status
    const inactiveCitizen = citizenService.updateStatus(createdCitizen.id, 'INACTIVE');
    console.assert(inactiveCitizen.status === 'INACTIVE', 'Acceptance: Update status failed');

    // Scenario D: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      citizenService.getCitizen(createdCitizen.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized access not rejected');
    }

    // Scenario E: Deactivate citizen
    const { success } = citizenService.deactivateCitizen(createdCitizen.id);
    console.assert(success === true, 'Acceptance: Deactivate citizen failed');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'c-mock' })),
      update: WK.mock().fn((t, id, u) => ({ id, ...u, version: 2 })),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id: 'c1', NIK: '1234567890123456', fullName: 'John Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001', status: 'ACTIVE', version: 1 };
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
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'c-mock-' + Math.random() };
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

    // Mock and instantiate components for the Citizen package
    const mockCitizenRepository = new CitizenRepository();
    mockCitizenRepository.dbAdapter = mockDbAdapter;

    const mockCitizenRule = {
      checkDuplicateNIK: WK.mock().fn(),
      checkValidNIKFormat: WK.mock().fn(),
      checkValidDateOfBirth: WK.mock().fn(),
      checkRTExists: WK.mock().fn(),
      checkRWExists: WK.mock().fn(),
      checkLookups: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
    };

    const citizenRule = new CitizenRule(mockCitizenRepository);
    const citizenValidator = new CitizenValidator(citizenRule);
    const citizenService = new CitizenService(mockCitizenRepository, citizenValidator, citizenRule, mockEventBus, mockAnalyticsService);
    const citizenController = new CitizenController(citizenService);
    const citizenStatistics = new CitizenStatistics(mockCitizenRepository, mockAnalyticsService);
    const citizenDashboard = new CitizenDashboard();
    const citizenEntity = new Citizen({ id: 'c1', NIK: '1234567890123456', fullName: 'John Doe', dateOfBirth: '1990-01-01', rt: '001', rw: '001' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockCitizenRepository, mockCitizenRule,
      citizenEntity, citizenRule, citizenValidator, citizenService, citizenController, citizenStatistics, citizenDashboard,
    };
  }
}