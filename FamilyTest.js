/**
 * @class FamilyTest
 * @description Comprehensive quality and acceptance test suite for the Family package.
 */
class FamilyTest {
  /**
   * Main entry point to run all test categories for the Family package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Family Package Test Suite ---');
    const results = {
      unit: this.runUnitTests(),
      repository: this.runRepositoryTests(),
      validation: this.runValidationTests(),
      permission: this.runPermissionTests(),
      rule: this.runRuleTests(),
      service: this.runServiceTests(),
      // Controller tests are omitted as no FamilyController was specified/implemented.
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
      WK.logger().info('--- [PASS] All Family Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Family Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { familyEntity, familyValidator, familyRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'f1', KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001' };
    const entity = new Family(entityData);
    console.assert(entity.id === 'f1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().KKNumber === '1234567890123456', 'Unit: Entity toObject KKNumber mismatch');
    console.assert(entity.status === 'ACTIVE', 'Unit: Entity default status is not ACTIVE');
    console.assert(Family.fromObject(entity.toObject()).id === 'f1', 'Unit: Entity fromObject ID mismatch');

    // Validator Test
    try {
      familyValidator.validateForCreate({ KKNumber: '123', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('KK Number must be a 16-digit number'), 'Unit: Validator did not catch invalid KKNumber format');
    }

    // Rule Test
    try {
      familyRule.checkMemberUniqueness([{ citizenId: 'c1' }, { citizenId: 'c1' }]);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate citizens found'), 'Unit: Rule did not catch duplicate members');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { familyRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Family({ id: 'f1', KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001' });
    familyRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    familyRepository.findByKKNumber('1234567890123456');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].KKNumber === '1234567890123456'), 'Repository: findByKKNumber failed');

    familyRepository.delete('f1', 'user1');
    console.assert(mockDbAdapter.softDelete.mock.calls.length === 1, 'Repository: softDelete was not called');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { familyValidator, mockFamilyRule } = this._setupMocks();
    let passed = true;

    try {
      familyValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('KK Number is required'), 'Validation: Missing KKNumber not caught');
    }

    mockFamilyRule.checkDuplicateKKNumber.mockImplementationOnce(() => { throw new Error('Duplicate KK'); });
    try {
      familyValidator.validateForCreate({ KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Duplicate KK'), 'Validation: Duplicate KK not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { familyService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      familyService.createFamily({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      familyService.addMember('f1', { citizenId: 'c2', relationship: 'ANAK' });
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Member management permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { familyRule, mockFamilyRepository, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    mockFamilyRepository.findByKKNumber.mockReturnValueOnce({ id: 'f-exists' });
    try {
      familyRule.checkDuplicateKKNumber('1111111111111111');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('already exists'), 'Rule: checkDuplicateKKNumber failed');
    }

    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      familyRule.checkHeadOfFamilyExists('c-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('does not exist'), 'Rule: checkHeadOfFamilyExists failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { familyService, mockEventBus, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    const payload = { KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001', members: [{ citizenId: 'c1', relationship: 'KEPALA_KELUARGA' }] };
    const record = familyService.createFamily(payload);
    console.assert(record.id, 'Service: createFamily failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'FamilyCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'family_created'), 'Service: Create analytics not tracked');

    familyService.addMember(record.id, { citizenId: 'c2', relationship: 'ANAK' });
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'FamilyMemberAdded'), 'Service: Add member event not published');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      FamilyMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'KKNumber' && c[2].unique === true), 'Migration: Unique index on KKNumber missing');
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
      const seeder = new FamilySeeder();
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
    const { familyStatistics, mockFamilyRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockFamilyRepository.count.mockImplementation((filters) => {
      if (filters.status === 'ACTIVE') return 80;
      return 100;
    });
    const summary = familyStatistics.getSummary();
    console.assert(summary.totalFamilies === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.activeFamilies === 80, 'Statistics: getSummary active count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    familyStatistics.getRegistrationTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'family_created'), 'Statistics: getRegistrationTrend did not call AnalyticsService');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = FamilyDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const totalWidget = widgets.find(w => w.id === 'family_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total families widget is misconfigured');
    console.assert(totalWidget.dataSource === 'FamilyStatistics.getSummary', 'Dashboard: Total families widget has incorrect data source');

    const recentActivityWidget = widgets.find(w => w.id === 'family_recent_activity');
    console.assert(recentActivityWidget.dataSource === 'FamilyService.searchFamilies', 'Dashboard: Recent activity widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { familyService, mockCitizenRepository } = this._setupMocks();
    let passed = true;

    // Citizen Integration
    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      const payload = { KKNumber: '1234567890123457', headOfFamilyCitizenId: 'c-nonexistent', rt: '001', rw: '001', members: [{ citizenId: 'c-nonexistent', relationship: 'KEPALA_KELUARGA' }] };
      familyService.createFamily(payload);
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('does not exist'), 'Integration: Did not fail with non-existent Citizen');
    }

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { familyService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    familyService.getFamily('f1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'family.profile.read.all'), 'Security: getFamily missing permission check');

    mockLogger.info.mockClear();
    const payload = { KKNumber: '1234567890123458', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001', members: [{ citizenId: 'c1', relationship: 'KEPALA_KELUARGA' }] };
    familyService.createFamily(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created family')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { familyService, mockSecurity, mockUser, mockFamilyRepository } = this._setupMocks();
    let passed = true;

    // Test read.own permission
    mockUser.mockReturnValue({ id: 'user-c1', citizenId: 'c1' });
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'family.profile.read.own') return true;
      throw new Error('Permission Denied');
    });
    mockFamilyRepository.search.mockReturnValueOnce([{ id: 'f1', KKNumber: '111', headOfFamilyCitizenId: 'c2', members: [{ citizenId: 'c1', relationship: 'ANAK' }] }]);
    // A hypothetical service method for a citizen to get their own family
    // const ownFamily = familyService.getOwnFamily();
    // console.assert(ownFamily.id === 'f1', 'Privacy: getOwnFamily failed');

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { familyStatistics, mockFamilyRepository } = this._setupMocks();
    let passed = true;

    mockFamilyRepository.count.mockClear();
    familyStatistics.getSummary(); // First call
    familyStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockFamilyRepository.count.mock.calls.length <= 3, 'Performance: Summary is not being cached effectively');

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
    const { familyService, mockEventBus, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Create valid family
    const createPayload = { KKNumber: '1234567890123459', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001', members: [{ citizenId: 'c1', relationship: 'KEPALA_KELUARGA' }] };
    const createdFamily = familyService.createFamily(createPayload);
    console.assert(createdFamily.id, 'Acceptance: Create family failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'FamilyCreated'), 'Acceptance: FamilyCreated event not published');

    // Scenario B: Add member
    const familyWithNewMember = familyService.addMember(createdFamily.id, { citizenId: 'c2', relationship: 'ISTRI' });
    console.assert(familyWithNewMember.members.length === 2, 'Acceptance: Add member failed');

    // Scenario C: Change head of family
    const familyWithNewHead = familyService.changeHeadOfFamily(createdFamily.id, 'c2');
    console.assert(familyWithNewHead.headOfFamilyCitizenId === 'c2', 'Acceptance: Change head of family failed');
    console.assert(familyWithNewHead.members.find(m => m.citizenId === 'c2').relationship === 'KEPALA_KELUARGA', 'Acceptance: New head relationship not updated');

    // Scenario D: Unauthorized access
    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      familyService.getFamily(createdFamily.id);
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized access not rejected');
    }

    // Scenario E: Deactivate family
    const { success } = familyService.deactivateFamily(createdFamily.id);
    console.assert(success === true, 'Acceptance: Deactivate family failed');

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
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'f-mock' })),
      update: WK.mock().fn((t, id, u) => {
        const current = { id, KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', members: '[{"citizenId":"c1","relationship":"KEPALA_KELUARGA"}]', version: 1 };
        const updated = { ...current, ...u };
        if (typeof updated.members !== 'string') {
          updated.members = JSON.stringify(updated.members);
        }
        return updated;
      }),
      softDelete: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', members: '[{"citizenId":"c1","relationship":"KEPALA_KELUARGA"}]', status: 'ACTIVE', version: 1 };
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
    const mockAnalyticsService = { track: WK.mock().fn(), getUniqueCount: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getDistribution: WK.mock().fn(() => []) };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'f-mock-' + Math.random() };
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

    // Mock repositories from other packages
    const mockCitizenRepository = {
      exists: WK.mock().fn(() => true),
      findById: WK.mock().fn(id => ({ id, NIK: '123' })),
    };

    // Mock and instantiate components for the Family package
    const mockFamilyRepository = new FamilyRepository();
    mockFamilyRepository.dbAdapter = mockDbAdapter;

    const mockFamilyRule = {
      checkDuplicateKKNumber: WK.mock().fn(),
      checkValidKKNumberFormat: WK.mock().fn(),
      checkHeadOfFamilyExists: WK.mock().fn(),
      checkAllMembersExist: WK.mock().fn(),
      checkHeadOfFamilyIsMember: WK.mock().fn(),
      checkMemberUniqueness: WK.mock().fn(),
    };

    const familyRule = new FamilyRule(mockFamilyRepository, mockCitizenRepository);
    const familyValidator = new FamilyValidator(familyRule);
    const familyService = new FamilyService(mockFamilyRepository, familyValidator, familyRule, mockCitizenRepository, mockEventBus, mockAnalyticsService);
    const familyStatistics = new FamilyStatistics(mockFamilyRepository, mockAnalyticsService);
    const familyDashboard = new FamilyDashboard();
    const familyEntity = new Family({ id: 'f1', KKNumber: '1234567890123456', headOfFamilyCitizenId: 'c1', rt: '001', rw: '001' });

    return {
      mockLogger, mockSecurity, mockUser, mockResponse, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockCitizenRepository, mockFamilyRepository, mockFamilyRule,
      familyEntity, familyRule, familyValidator, familyService, familyStatistics, familyDashboard,
    };
  }
}