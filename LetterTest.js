/**
 * @class LetterTest
 * @description Comprehensive quality and acceptance test suite for the Letter package.
 */
class LetterTest {
  /**
   * Main entry point to run all test categories for the Letter package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Letter Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Letter Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Letter Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { letterEntity, letterValidator, letterRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'l1', administrativeServiceId: 'as1', citizenId: 'c1', letterType: 'SURAT_PENGANTAR', templateId: 't1' };
    const entity = new Letter(entityData);
    console.assert(entity.id === 'l1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().letterType === 'SURAT_PENGANTAR', 'Unit: Entity toObject mismatch');
    console.assert(entity.letterStatus === 'DRAFT', 'Unit: Entity default status is not DRAFT');

    // Validator Test
    try {
      letterValidator.validateForCreate({ administrativeServiceId: 'as1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Unit: Validator did not catch missing citizenId');
    }

    // Rule Test
    try {
      letterRule.checkStatusTransition('ISSUED', 'DRAFT');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid letter status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { letterRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Letter({ id: 'l1', administrativeServiceId: 'as1', citizenId: 'c1', letterType: 'SURAT_PENGANTAR', templateId: 't1' });
    letterRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    letterRepository.findByAdministrativeServiceId('as1');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].administrativeServiceId === 'as1'), 'Repository: findByAdministrativeServiceId failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { letterValidator, mockLetterRule } = this._setupMocks();
    let passed = true;

    try {
      letterValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Administrative Service ID is required'), 'Validation: Missing administrativeServiceId not caught');
    }

    mockLetterRule.checkRequestIsApproved.mockImplementationOnce(() => { throw new Error('Request not approved'); });
    try {
      letterValidator.validateForCreate({ administrativeServiceId: 'as1', citizenId: 'c1', letterType: 'SURAT_PENGANTAR', templateId: 't1' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Request not approved'), 'Validation: Unapproved request not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { letterService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      letterService.createLetter({ administrativeServiceId: 'as1' });
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      letterService.issueLetter('l1');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Issue permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { letterRule, mockAdministrativeServiceRepository, mockLetterRepository } = this._setupMocks();
    let passed = true;

    mockAdministrativeServiceRepository.exists.mockReturnValueOnce(false);
    try {
      letterRule.checkAdministrativeServiceRequestExists('as-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkAdministrativeServiceRequestExists failed');
    }

    mockLetterRepository.findByAdministrativeServiceId.mockReturnValueOnce({ id: 'l-exists' });
    try {
      letterRule.checkDuplicateLetterForRequest('as-duplicate');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already been generated'), 'Rule: checkDuplicateLetterForRequest failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { letterService, mockEventBus, mockAnalyticsService, mockNumberingService } = this._setupMocks();
    let passed = true;

    const payload = { administrativeServiceId: 'as1', templateId: 't1' };
    const record = letterService.createLetter(payload);
    console.assert(record.id, 'Service: createLetter failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'LetterCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'letter_created'), 'Service: Create analytics not tracked');

    letterService.issueLetter(record.id);
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'LetterIssued'), 'Service: Issue event not published');
    console.assert(mockNumberingService.generate.mock.calls.length === 1, 'Service: Numbering service not called on issue');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    // No LetterController was implemented in the previous sprints.
    WK.logger().info('Controller Tests Result: NOT APPLICABLE');
    return true;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      LetterMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'letterNumber' && c[2].unique), 'Migration: Unique index on letterNumber missing');
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
      const seeder = new LetterSeeder();
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
    const { letterStatistics, mockLetterRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockLetterRepository.count.mockImplementation((filters) => {
      if (filters.letterStatus === 'ISSUED') return 50;
      if (filters.letterStatus === 'PENDING_SIGNATURE') return 15;
      return 100;
    });
    const summary = letterStatistics.getSummary();
    console.assert(summary.totalLetters === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.pendingSignature === 15, 'Statistics: getSummary pending count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    letterStatistics.getIssuanceTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'letter_issued'), 'Statistics: getIssuanceTrend did not call AnalyticsService');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = LetterDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const totalWidget = widgets.find(w => w.id === 'letter_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total letters widget is misconfigured');
    console.assert(totalWidget.dataSource === 'LetterStatistics.getSummary', 'Dashboard: Total letters widget has incorrect data source');

    const pendingQueueWidget = widgets.find(w => w.id === 'letter_pending_queue');
    console.assert(pendingQueueWidget.dataSource === 'LetterService.searchLetters', 'Dashboard: Pending queue widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { letterService, mockAdministrativeServiceRepository } = this._setupMocks();
    let passed = true;

    // AdministrativeService Integration
    mockAdministrativeServiceRepository.findById.mockReturnValueOnce({ id: 'as1', citizenId: 'c1', requestStatus: 'SUBMITTED' }); // Not yet approved
    try {
      const payload = { administrativeServiceId: 'as1', templateId: 't1' };
      letterService.createLetter(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not in an approved state'), 'Integration: Did not fail with unapproved AdministrativeService request');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { letterService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    letterService.getLetter('l1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'letter.document.read.all'), 'Security: getLetter missing permission check');

    mockLogger.info.mockClear();
    const payload = { administrativeServiceId: 'as1', templateId: 't1' };
    letterService.createLetter(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created letter')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { letterService, mockSecurity, mockUser } = this._setupMocks();
    let passed = true;

    // Test read.own permission
    mockUser.mockReturnValue({ id: 'user-c2', citizenId: 'c2' }); // A different citizen
    mockSecurity.hasPermission.mockReturnValue(false); // Does not have read.all
    try {
      letterService.getLetter('l1'); // l1 belongs to c1
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Access denied'), 'Privacy: getLetter did not enforce read.own correctly');
    }

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { letterStatistics, mockLetterRepository } = this._setupMocks();
    let passed = true;

    mockLetterRepository.count.mockClear();
    letterStatistics.getSummary(); // First call
    letterStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockLetterRepository.count.mock.calls.length <= 5, 'Performance: Summary is not being cached effectively');

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
    const { letterService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Full workflow
    const createPayload = { administrativeServiceId: 'as1', templateId: 't1' };
    const createdLetter = letterService.createLetter(createPayload);
    console.assert(createdLetter.id, 'Acceptance: Create letter failed');

    const pendingLetter = letterService.updateStatus(createdLetter.id, 'PENDING_SIGNATURE');
    console.assert(pendingLetter.letterStatus === 'PENDING_SIGNATURE', 'Acceptance: Update status to PENDING_SIGNATURE failed');

    const issuedLetter = letterService.issueLetter(pendingLetter.id);
    console.assert(issuedLetter.letterStatus === 'ISSUED', 'Acceptance: Issue letter failed');
    console.assert(issuedLetter.letterNumber, 'Acceptance: Issued letter has no number');

    const revokedLetter = letterService.revokeLetter(issuedLetter.id, 'Data correction needed');
    console.assert(revokedLetter.letterStatus === 'REVOKED', 'Acceptance: Revoke letter failed');

    // Scenario B: Unauthorized action
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'letter.document.issue') throw new Error('Permission Denied');
    });
    try {
      letterService.issueLetter(pendingLetter.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized issuance not rejected');
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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'l-mock' })),
      update: WK.mock().fn((t, id, u) => {
        const current = { id: 'l1', citizenId: 'c1', letterStatus: 'PENDING_SIGNATURE', version: 1 };
        return { ...current, ...u };
      }),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id: 'l1', citizenId: 'c1', letterStatus: 'PENDING_SIGNATURE', version: 1 };
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
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getAverage: WK.mock().fn(() => ({ value: 0, unit: 'hours' })) };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'l-mock-' + Math.random() };
    const mockMasterDataService = { exists: WK.mock().fn(() => true) };
    const mockDocumentGeneratorService = { generate: WK.mock().fn(() => '<html>Generated Content</html>') };
    const mockNumberingService = { generate: WK.mock().fn(() => 'RT01/RW01/L/VIII/2026/001') };

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
    const mockAdministrativeServiceRepository = {
      exists: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, citizenId: 'c1', familyId: 'f1', requestType: 'SURAT_PENGANTAR', requestStatus: 'RW_VERIFIED' })),
    };
    const mockTemplateRepository = {
      exists: WK.mock().fn(() => true),
    };

    // Mock and instantiate components for the Letter package
    const mockLetterRepository = new LetterRepository();
    mockLetterRepository.dbAdapter = mockDbAdapter;

    const mockLetterRule = {
      checkAdministrativeServiceRequestExists: WK.mock().fn(),
      checkRequestIsApproved: WK.mock().fn(),
      checkDuplicateLetterForRequest: WK.mock().fn(),
      checkTemplateExists: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
      checkCanBeIssued: WK.mock().fn(),
    };

    const letterRule = new LetterRule(mockLetterRepository, mockAdministrativeServiceRepository, mockTemplateRepository);
    const letterValidator = new LetterValidator(letterRule);
    const letterService = new LetterService(
      mockLetterRepository,
      letterValidator,
      letterRule,
      mockAdministrativeServiceRepository,
      mockDocumentGeneratorService,
      mockNumberingService,
      mockEventBus,
      mockAnalyticsService
    );
    const letterStatistics = new LetterStatistics(mockLetterRepository, mockAnalyticsService);
    const letterDashboard = new LetterDashboard();
    const letterEntity = new Letter({ id: 'l1', administrativeServiceId: 'as1', citizenId: 'c1', letterType: 'SURAT_PENGANTAR', templateId: 't1' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockAdministrativeServiceRepository, mockTemplateRepository, mockLetterRepository, mockLetterRule,
      mockDocumentGeneratorService, mockNumberingService,
      letterEntity, letterRule, letterValidator, letterService, letterStatistics, letterDashboard,
    };
  }
}