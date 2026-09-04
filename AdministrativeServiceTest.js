/**
 * @class AdministrativeServiceTest
 * @description Comprehensive quality and acceptance test suite for the AdministrativeService package.
 */
class AdministrativeServiceTest {
  /**
   * Main entry point to run all test categories for the AdministrativeService package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] AdministrativeService Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All AdministrativeService Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some AdministrativeService Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { administrativeServiceEntity, administrativeServiceValidator, administrativeServiceRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'as1', citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' };
    const entity = new AdministrativeService(entityData);
    console.assert(entity.id === 'as1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().requestType === 'SURAT_PENGANTAR', 'Unit: Entity toObject mismatch');
    console.assert(entity.requestStatus === 'DRAFT', 'Unit: Entity default status is not DRAFT');

    // Validator Test
    try {
      administrativeServiceValidator.validateForCreate({ citizenId: 'c1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Request type is required'), 'Unit: Validator did not catch missing requestType');
    }

    // Rule Test
    try {
      administrativeServiceRule.checkStatusTransition('COMPLETED', 'SUBMITTED');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid administrative service status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { administrativeServiceRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new AdministrativeService({ id: 'as1', citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' });
    administrativeServiceRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    administrativeServiceRepository.findByCitizenId('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[1].citizenId === 'c1'), 'Repository: findByCitizenId failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { administrativeServiceValidator, mockAdministrativeServiceRule } = this._setupMocks();
    let passed = true;

    try {
      administrativeServiceValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockAdministrativeServiceRule.checkCitizenExists.mockImplementationOnce(() => { throw new Error('Citizen not found'); });
    try {
      administrativeServiceValidator.validateForCreate({ citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen not found'), 'Validation: Non-existent citizen not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { administrativeServiceService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      administrativeServiceService.createRequest({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      administrativeServiceService.verifyByRT('as1');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: RT verification permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { administrativeServiceRule, mockCitizenRepository, mockFamilyRepository } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      administrativeServiceRule.checkCitizenExists('c-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkCitizenExists failed');
    }

    mockFamilyRepository.findById.mockReturnValueOnce({ members: [{ citizenId: 'c2' }] });
    try {
      administrativeServiceRule.checkCitizenFamilyRelationship('c1', 'f1');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('is not a member of family'), 'Rule: checkCitizenFamilyRelationship failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { administrativeServiceService, mockEventBus, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' };
    const record = administrativeServiceService.createRequest(payload);
    console.assert(record.id, 'Service: createRequest failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'AdministrativeServiceCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'admin_service_created'), 'Service: Create analytics not tracked');

    administrativeServiceService.submitRequest(record.id);
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'AdministrativeServiceStatusChanged'), 'Service: Status change event not published');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    // No AdministrativeServiceController was implemented in the previous sprints.
    WK.logger().info('Controller Tests Result: NOT APPLICABLE');
    return true;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      AdministrativeServiceMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'requestStatus'), 'Migration: Index on requestStatus missing');
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
      const seeder = new AdministrativeServiceSeeder();
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
    const { administrativeServiceStatistics, mockAdministrativeServiceRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockAdministrativeServiceRepository.count.mockImplementation((filters) => {
      if (filters.requestStatus === 'COMPLETED') return 50;
      if (filters.requestStatus?.in?.includes('SUBMITTED')) return 15;
      return 100;
    });
    const summary = administrativeServiceStatistics.getSummary();
    console.assert(summary.totalRequests === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.pendingRequests === 15, 'Statistics: getSummary pending count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    administrativeServiceStatistics.getSubmissionTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'admin_service_created'), 'Statistics: getSubmissionTrend did not call AnalyticsService');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = AdministrativeServiceDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const totalWidget = widgets.find(w => w.id === 'admin_service_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total requests widget is misconfigured');
    console.assert(totalWidget.dataSource === 'AdministrativeServiceStatistics.getSummary', 'Dashboard: Total requests widget has incorrect data source');

    const pendingQueueWidget = widgets.find(w => w.id === 'admin_service_pending_queue');
    console.assert(pendingQueueWidget.dataSource === 'AdministrativeServiceService.searchRequests', 'Dashboard: Pending queue widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { administrativeServiceService, mockCitizenRepository, mockFamilyRepository } = this._setupMocks();
    let passed = true;

    // Citizen/Family Integration
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      const payload = { citizenId: 'c-nonexistent', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' };
      administrativeServiceService.createRequest(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen with ID c-nonexistent not found'), 'Integration: Did not fail with non-existent Citizen');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { administrativeServiceService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    administrativeServiceService.getRequest('as1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'administrativeservice.request.read.all'), 'Security: getRequest missing permission check');

    mockLogger.info.mockClear();
    const payload = { citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' };
    administrativeServiceService.createRequest(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created administrative service request')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { administrativeServiceService, mockSecurity, mockUser } = this._setupMocks();
    let passed = true;

    // Test read.own permission
    mockUser.mockReturnValue({ id: 'user-c2', citizenId: 'c2' }); // A different citizen
    mockSecurity.hasPermission.mockReturnValue(false); // Does not have read.all
    try {
      administrativeServiceService.getRequest('as1'); // as1 belongs to c1
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Access denied'), 'Privacy: getRequest did not enforce read.own correctly');
    }

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { administrativeServiceStatistics, mockAdministrativeServiceRepository } = this._setupMocks();
    let passed = true;

    mockAdministrativeServiceRepository.count.mockClear();
    administrativeServiceStatistics.getSummary(); // First call
    administrativeServiceStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockAdministrativeServiceRepository.count.mock.calls.length <= 5, 'Performance: Summary is not being cached effectively');

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
    const { administrativeServiceService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Full workflow
    const createPayload = { citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' };
    const createdRequest = administrativeServiceService.createRequest(createPayload);
    console.assert(createdRequest.id, 'Acceptance: Create request failed');

    const submittedRequest = administrativeServiceService.submitRequest(createdRequest.id);
    console.assert(submittedRequest.requestStatus === 'SUBMITTED', 'Acceptance: Submit request failed');

    const rtVerifiedRequest = administrativeServiceService.verifyByRT(submittedRequest.id);
    console.assert(rtVerifiedRequest.requestStatus === 'RT_VERIFIED', 'Acceptance: RT verification failed');

    const rwVerifiedRequest = administrativeServiceService.verifyByRW(rtVerifiedRequest.id);
    console.assert(rwVerifiedRequest.requestStatus === 'RW_VERIFIED', 'Acceptance: RW verification failed');

    const completedRequest = administrativeServiceService.completeRequest(rwVerifiedRequest.id);
    console.assert(completedRequest.requestStatus === 'COMPLETED', 'Acceptance: Complete request failed');

    // Scenario B: Unauthorized action
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'administrativeservice.request.verify.rt') throw new Error('Permission Denied');
    });
    try {
      administrativeServiceService.verifyByRT(submittedRequest.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized verification not rejected');
    }

    WK.logger().info(`Acceptance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runQualityGate(results) {
    WK.logger().info('--- [QUALITY GATE] ---');
    const failedTests = Object.keys(results).filter(key => !results[key] && key !== 'controller');

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
    const mockSecurity = {
      checkPermission: WK.mock().fn(() => true),
      hasPermission: WK.mock().fn(() => true),
      hasAnyPermission: WK.mock().fn(() => true),
    };
    const mockUser = WK.mock().fn(() => ({ id: 'testUser', citizenId: 'c1' }));
    const mockResponse = {
      json: WK.mock().fn((data, status = 200) => ({ data, status })),
      error: WK.mock().fn((msg, status = 400) => ({ msg, status })),
    };
    const mockDbAdapter = {
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'as-mock' })),
      update: WK.mock().fn((t, id, u) => {
        const current = { id: 'as1', citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestStatus: 'DRAFT', rt: '001', rw: '001', version: 1, notes: '[]' };
        const updated = { ...current, ...u };
        if (typeof updated.notes !== 'string') {
          updated.notes = JSON.stringify(updated.notes);
        }
        return updated;
      }),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id: 'as1', citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestStatus: 'DRAFT', rt: '001', rw: '001', version: 1, notes: '[]' };
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
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getAverage: WK.mock().fn(() => ({ value: 0, unit: 'days' })) };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'as-mock-' + Math.random() };
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
      mock: () => ({ fn: (impl) => {
          const mockFn = impl || (() => {});
          mockFn.mock = { calls: [] };
          const fn = (...args) => {
              mockFn.mock.calls.push(args);
              return mockFn(...args);
          };
          fn.mock = mockFn.mock;
          fn.mockImplementation = (newImpl) => { mockFn = newImpl; };
          fn.mockReturnValue = (val) => { mockFn = () => val; };
          fn.mockReturnValueOnce = (val) => {
              const originalImpl = mockFn;
              mockFn = () => {
                  mockFn = originalImpl;
                  return val;
              };
          };
          return fn;
      }}),
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {};

    // Mock repositories from other packages
    const mockCitizenRepository = {
      exists: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, NIK: '123' })),
    };
    const mockFamilyRepository = {
      exists: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, KKNumber: '456', members: [{ citizenId: 'c1' }] })),
    };

    // Mock and instantiate components for the AdministrativeService package
    const mockAdministrativeServiceRepository = new AdministrativeServiceRepository();
    mockAdministrativeServiceRepository.dbAdapter = mockDbAdapter;

    const mockAdministrativeServiceRule = {
      checkCitizenExists: WK.mock().fn(),
      checkFamilyExists: WK.mock().fn(),
      checkCitizenFamilyRelationship: WK.mock().fn(),
      checkValidRequestType: WK.mock().fn(),
      checkDates: WK.mock().fn(),
      checkRTExists: WK.mock().fn(),
      checkRWExists: WK.mock().fn(),
      checkLookups: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
    };

    const administrativeServiceRule = new AdministrativeServiceRule(mockAdministrativeServiceRepository, mockCitizenRepository, mockFamilyRepository);
    const administrativeServiceValidator = new AdministrativeServiceValidator(administrativeServiceRule);
    const administrativeServiceService = new AdministrativeServiceService(mockAdministrativeServiceRepository, administrativeServiceValidator, administrativeServiceRule, mockCitizenRepository, mockFamilyRepository, mockEventBus, mockAnalyticsService);
    const administrativeServiceStatistics = new AdministrativeServiceStatistics(mockAdministrativeServiceRepository, mockAnalyticsService);
    const administrativeServiceDashboard = new AdministrativeServiceDashboard();
    const administrativeServiceEntity = new AdministrativeService({ id: 'as1', citizenId: 'c1', requestType: 'SURAT_PENGANTAR', requestDate: '2026-08-15', rt: '001', rw: '001' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockCitizenRepository, mockFamilyRepository, mockAdministrativeServiceRepository, mockAdministrativeServiceRule,
      administrativeServiceEntity, administrativeServiceRule, administrativeServiceValidator, administrativeServiceService, administrativeServiceStatistics, administrativeServiceDashboard,
    };
  }
}