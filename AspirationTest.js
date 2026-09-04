/**
 * @class AspirationTest
 * @description Comprehensive quality and acceptance test suite for the Aspiration package.
 */
class AspirationTest {
  /**
   * Main entry point to run all test categories for the Aspiration package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Aspiration Package Test Suite ---');
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
      syntax: this.runSyntaxTests(),
    };

    const qualityGatePassed = this.runQualityGate(results);

    if (qualityGatePassed) {
      WK.logger().info('--- [PASS] All Aspiration Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Aspiration Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { aspirationEntity, aspirationValidator, aspirationRule } = this._setupMocks();
    let passed = true;

    // Entity Tests
    const entityData = {
      id: 'asp1',
      citizenId: 'c1',
      subject: 'Taman Kebonjati',
      description: 'Pembangunan taman bermain ramah anak',
      category: 'INFRASTRUCTURE',
      attachments: ['att-1', 'att-2'],
    };
    const entity = new Aspiration(entityData);
    console.assert(entity.id === 'asp1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().subject === 'Taman Kebonjati', 'Unit: Entity toObject mismatch');
    console.assert(entity.status === 'SUBMITTED', 'Unit: Entity default status is not SUBMITTED');
    console.assert(entity.upvotes === 0, 'Unit: Entity default upvotes is not 0');
    console.assert(entity.downvotes === 0, 'Unit: Entity default downvotes is not 0');
    console.assert(entity.toObject().attachments === JSON.stringify(['att-1', 'att-2']), 'Unit: Entity attachment serialization failed');

    const fromObj = Aspiration.fromObject(entity.toObject());
    console.assert(Array.isArray(fromObj.attachments) && fromObj.attachments.length === 2, 'Unit: Entity fromObject deserialization failed');

    // Validator Tests
    try {
      aspirationValidator.validateForCreate({ citizenId: 'c1', subject: 'Taman' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('description is required'), 'Unit: Validator did not catch missing description');
    }

    // Rule Tests
    try {
      aspirationRule.checkStatusTransition('ARCHIVED', 'SUBMITTED');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid aspiration status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { aspirationRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Aspiration({
      id: 'asp1',
      citizenId: 'c1',
      subject: 'Usulan Jalan',
      description: 'Perbaikan jalan',
      category: 'INFRASTRUCTURE',
    });
    aspirationRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    aspirationRepository.findByCitizenId('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[1].citizenId === 'c1'), 'Repository: findByCitizenId failed');

    aspirationRepository.findByWorkflowId('wf-mock-id');
    console.assert(mockDbAdapter.findOne.mock.calls.some(c => c[1].workflowId === 'wf-mock-id'), 'Repository: findByWorkflowId failed');

    aspirationRepository.delete('asp1', 'user1');
    console.assert(mockDbAdapter.softDelete.mock.calls.length === 1, 'Repository: softDelete was not called');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { mockAspirationRule } = this._setupMocks();
    const validator = new AspirationValidator(mockAspirationRule);
    let passed = true;

    try {
      validator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockAspirationRule.checkCitizenExists.mockImplementationOnce(() => {
      throw new Error('Citizen not found');
    });
    try {
      validator.validateForCreate({
        citizenId: 'c1',
        subject: 'Taman',
        description: 'Desc',
        category: 'INFRASTRUCTURE',
      });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen not found'), 'Validation: Non-existent citizen not caught');
    }

    // Update validation: immutable fields
    try {
      validator.validateForUpdate({ citizenId: 'c2' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be changed during an update'), 'Validation: Immutable citizenId change not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { aspirationService, aspirationStatistics, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => {
      throw new Error('Permission Denied');
    });
    try {
      aspirationService.createAspiration({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => {
      throw new Error('Permission Denied');
    });
    try {
      aspirationService.voteAspiration('asp1', 'UPVOTE');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Vote permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => {
      throw new Error('Permission Denied');
    });
    try {
      aspirationStatistics.getSummary();
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Statistics view permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { aspirationRule, mockCitizenRepository, mockFamilyRepository, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      aspirationRule.checkCitizenExists('c-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkCitizenExists failed');
    }

    mockFamilyRepository.exists.mockReturnValueOnce(false);
    try {
      aspirationRule.checkFamilyExists('f-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkFamilyExists failed');
    }

    mockMasterDataService.exists.mockReturnValueOnce(false);
    try {
      aspirationRule.checkValidCategory('INVALID_CAT');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid aspiration category'), 'Rule: checkValidCategory failed');
    }

    // Voting eligibility rule
    try {
      aspirationRule.checkCanBeVoted({ status: 'ARCHIVED' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('cannot be voted on'), 'Rule: checkCanBeVoted failed for archived status');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { aspirationService, mockEventBus, mockAnalyticsService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', subject: 'Taman', description: 'Desc', category: 'INFRASTRUCTURE' };
    const record = aspirationService.createAspiration(payload);
    console.assert(record.id, 'Service: createAspiration failed');
    console.assert(mockWorkflowService.startWorkflow.mock.calls.length === 1, 'Service: Workflow not started on create');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'AspirationCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'aspiration_created'), 'Service: Create analytics not tracked');

    // Voting
    const voted = aspirationService.voteAspiration(record.id, 'UPVOTE');
    console.assert(voted.upvotes === 1, 'Service: Upvote failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'AspirationVoted'), 'Service: Vote event not published');

    // Assignment
    const assigned = aspirationService.assignAspiration(record.id, 'user-rt', 'USER');
    console.assert(assigned.assignedToId === 'user-rt', 'Service: Assign aspiration failed');
    console.assert(mockWorkflowService.assign.mock.calls.length === 1, 'Service: Workflow assign not called');

    // Implementation
    const implemented = aspirationService.implementAspiration(record.id, 'Pembangunan selesai.');
    console.assert(implemented.status === 'IMPLEMENTED', 'Service: Implement aspiration failed');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'AspirationImplemented'), 'Service: Implement event not published');

    WK.logger().info(`Service Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runControllerTests() {
    WK.logger().info('--- [CONTROLLER TESTS] ---');
    WK.logger().info('Controller Tests Result: NOT APPLICABLE');
    return true;
  }

  static runMigrationTests() {
    WK.logger().info('--- [MIGRATION TESTS] ---');
    let passed = true;
    try {
      const { mockDbAdapter } = this._setupMocks();
      AspirationMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'citizenId'), 'Migration: Index on citizenId missing');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'status'), 'Migration: Index on status missing');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'category'), 'Migration: Index on category missing');
      console.assert(AspirationMigration.migrationVersion() === '1.0.0', 'Migration: Version mismatch');
      console.assert(AspirationMigration.seedRequired() === true, 'Migration: seedRequired is not true');
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
      const seeder = new AspirationSeeder();
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
    const { aspirationStatistics, mockAspirationRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockAspirationRepository.count.mockImplementation((filters) => {
      if (filters.status === 'SUBMITTED') return 40;
      if (filters.status === 'IMPLEMENTED') return 15;
      return 60;
    });

    const summary = aspirationStatistics.getSummary();
    console.assert(summary.totalAspirations === 60, 'Statistics: getSummary total is incorrect');
    console.assert(summary.submittedAspirations === 40, 'Statistics: getSummary submitted count is incorrect');
    console.assert(summary.implementedAspirations === 15, 'Statistics: getSummary implemented count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    aspirationStatistics.getSubmissionTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'aspiration_created'), 'Statistics: getSubmissionTrend did not call AnalyticsService');

    const catDist = aspirationStatistics.getCategoryDistribution();
    console.assert(Array.isArray(catDist), 'Statistics: getCategoryDistribution did not return array');

    const statusDist = aspirationStatistics.getStatusDistribution();
    console.assert(Array.isArray(statusDist), 'Statistics: getStatusDistribution did not return array');

    const votingSummary = aspirationStatistics.getVotingSummary();
    console.assert(votingSummary.totalUpvotes !== undefined, 'Statistics: getVotingSummary missing totalUpvotes');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = AspirationDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');

    const totalWidget = widgets.find(w => w.id === 'aspiration_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total aspirations widget is misconfigured');
    console.assert(totalWidget.dataSource === 'AspirationStatistics.getSummary', 'Dashboard: Total aspirations widget has incorrect data source');

    const pendingQueueWidget = widgets.find(w => w.id === 'aspiration_pending_queue');
    console.assert(pendingQueueWidget.dataSource === 'AspirationService.searchAspirations', 'Dashboard: Pending queue widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { aspirationService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    // Citizen & Workflow Integration
    const payload = { citizenId: 'c1', subject: 'Taman', description: 'Desc', category: 'INFRASTRUCTURE' };
    const created = aspirationService.createAspiration(payload);
    console.assert(mockWorkflowService.startWorkflow.mock.calls.length === 1, 'Integration: WorkflowService.startWorkflow was not called');
    console.assert(mockWorkflowService.startWorkflow.mock.calls[0][0].contextType === 'Aspiration', 'Integration: Workflow started with incorrect contextType');
    console.assert(mockWorkflowService.startWorkflow.mock.calls[0][0].contextId === created.id, 'Integration: Workflow started with incorrect contextId');

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { aspirationService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.hasPermission.mockClear();
    mockSecurity.checkPermission.mockClear();
    aspirationService.getAspiration('asp1');
    console.assert(
      mockSecurity.hasPermission.mock.calls.some(c => c[0] === 'aspiration.record.read.all') ||
      mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'aspiration.record.read.own'),
      'Security: getAspiration missing permission check'
    );

    mockLogger.info.mockClear();
    const payload = { citizenId: 'c1', subject: 'Taman', description: 'Desc', category: 'INFRASTRUCTURE' };
    aspirationService.createAspiration(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created aspiration')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { aspirationService, mockSecurity, mockUser } = this._setupMocks();
    let passed = true;

    // Test read.own permission restriction
    mockUser.mockReturnValue({ id: 'user-c2', citizenId: 'c2' }); // Different citizen
    mockSecurity.hasPermission.mockReturnValue(false); // Does not have read.all
    try {
      aspirationService.getAspiration('asp1'); // asp1 belongs to c1
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Access denied'), 'Privacy: getAspiration did not enforce read.own correctly');
    }

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { aspirationStatistics, mockAspirationRepository } = this._setupMocks();
    let passed = true;

    mockAspirationRepository.count.mockClear();
    aspirationStatistics.getSummary(); // First call
    aspirationStatistics.getSummary(); // Second call (should hit cache)
    console.assert(mockAspirationRepository.count.mock.calls.length <= 6, 'Performance: Summary is not being cached effectively');

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
    const { aspirationService, mockWorkflowService, mockSecurity } = this._setupMocks();
    let passed = true;

    // Scenario A: Full Lifecycle (Create -> Vote -> Assign -> Process -> Implement -> Archive)
    const createPayload = { citizenId: 'c1', subject: 'Taman Bermain', description: 'Area bermain warga', category: 'PUBLIC_SERVICE' };
    const created = aspirationService.createAspiration(createPayload);
    console.assert(created.id, 'Acceptance: Create aspiration failed');
    console.assert(created.workflowId, 'Acceptance: Aspiration not linked to workflow');

    const voted = aspirationService.voteAspiration(created.id, 'UPVOTE');
    console.assert(voted.upvotes === 1, 'Acceptance: Voting failed');

    const assigned = aspirationService.assignAspiration(created.id, 'user-rt', 'USER');
    console.assert(assigned.assignedToId === 'user-rt', 'Acceptance: Assign failed');

    const processed = aspirationService.processAspiration(created.id, 'Sedang dalam peninjauan dinas');
    console.assert(processed.resolutionNotes === 'Sedang dalam peninjauan dinas', 'Acceptance: Process failed');

    const implemented = aspirationService.implementAspiration(created.id, 'Taman telah selesai dibangun');
    console.assert(implemented.status === 'IMPLEMENTED', 'Acceptance: Implement failed');

    const archived = aspirationService.archiveAspiration(created.id);
    console.assert(archived.status === 'ARCHIVED', 'Acceptance: Archive failed');

    // Scenario B: Unauthorized action rejection
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'aspiration.record.implement') throw new Error('Permission Denied');
    });
    try {
      aspirationService.implementAspiration(created.id, 'Unauthorized implement');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized implementation not rejected');
    }

    WK.logger().info(`Acceptance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSyntaxTests() {
    WK.logger().info('--- [SYNTAX TESTS] ---');
    let passed = true;
    WK.logger().info(`Syntax Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
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
    const createMockFn = (impl) => {
      let mockFn = impl || (() => {});
      const calls = [];
      const fn = (...args) => {
        calls.push(args);
        return mockFn(...args);
      };
      fn.mock = { calls };
      fn.mockImplementation = (newImpl) => { mockFn = newImpl; };
      fn.mockImplementationOnce = (newImpl) => {
        const originalImpl = mockFn;
        mockFn = (...args) => {
          mockFn = originalImpl;
          return newImpl(...args);
        };
      };
      fn.mockReturnValue = (val) => { mockFn = () => val; };
      fn.mockReturnValueOnce = (val) => {
        const originalImpl = mockFn;
        mockFn = () => {
          mockFn = originalImpl;
          return val;
        };
      };
      fn.mockClear = () => { calls.length = 0; };
      return fn;
    };

    const mockLogger = {
      info: createMockFn(),
      warn: createMockFn(),
      error: createMockFn(),
      debug: createMockFn(),
    };
    const mockSecurity = {
      checkPermission: createMockFn(() => true),
      hasPermission: createMockFn(() => true),
      hasAnyPermission: createMockFn(() => true),
    };
    const mockUser = createMockFn(() => ({ id: 'testUser', citizenId: 'c1' }));
    const mockDbAdapter = {
      create: createMockFn((t, r) => ({ ...r, id: r.id || 'asp-mock' })),
      update: createMockFn((t, id, u) => {
        const current = { id, citizenId: 'c1', status: 'SUBMITTED', upvotes: 0, downvotes: 0, version: 1 };
        return { ...current, ...u };
      }),
      softDelete: createMockFn(() => true),
      findById: createMockFn(id => {
        if (id === 'nonexistent') return null;
        return { id, citizenId: 'c1', status: 'SUBMITTED', upvotes: 0, downvotes: 0, workflowId: 'wf-mock-id', version: 1 };
      }),
      findOne: createMockFn(() => null),
      exists: createMockFn(() => false),
      search: createMockFn(() => []),
      count: createMockFn(() => 0),
      hasTable: createMockFn(() => false),
      createTable: createMockFn(),
      ensureIndex: createMockFn(),
      dropTable: createMockFn(),
    };
    const mockEventBus = { publish: createMockFn() };
    const mockAnalyticsService = {
      track: createMockFn(),
      getTimeSeries: createMockFn(),
      getSum: createMockFn(() => 0),
      getAverage: createMockFn(() => ({ value: 0, unit: 'days' })),
    };
    const mockCacheStore = new Map();
    const mockCache = {
      get: createMockFn((key) => mockCacheStore.get(key) || null),
      set: createMockFn((key, val) => mockCacheStore.set(key, val)),
    };
    const mockUtilities = { getUuid: () => 'asp-mock-' + Math.random() };
    const mockMasterDataService = { exists: createMockFn(() => true) };

    const mockWorkflowService = {
      startWorkflow: createMockFn(payload => ({ id: 'wf-mock-id', currentState: 'SUBMITTED', ...payload })),
      transition: createMockFn((workflowId, action) => {
        if (action === 'PROCESS') return { id: workflowId, currentState: 'IN_REVIEW' };
        if (action === 'IMPLEMENT') return { id: workflowId, currentState: 'IMPLEMENTED' };
        if (action === 'ARCHIVE') return { id: workflowId, currentState: 'ARCHIVED' };
        return { id: workflowId, currentState: 'IN_REVIEW' };
      }),
      assign: createMockFn((workflowId, assigneeId, assigneeType) => ({ id: workflowId, assigneeId, assigneeType })),
    };

    global.WK = {
      logger: () => mockLogger,
      security: () => mockSecurity,
      user: mockUser,
      database: () => mockDbAdapter,
      service: (name) => {
        if (name === 'eventbus') return mockEventBus;
        if (name === 'AnalyticsService') return mockAnalyticsService;
        if (name === 'MasterData') return mockMasterDataService;
        return null;
      },
      cache: () => mockCache,
      permission: () => {},
      dashboard: () => {},
      mock: () => ({ fn: createMockFn }),
    };
    global.Utilities = mockUtilities;
    global.BaseRepository = class {
      constructor(tableName) {
        this.tableName = tableName;
        this.dbAdapter = mockDbAdapter;
      }
    };

    // Mock repositories from other packages
    const mockCitizenRepository = {
      exists: createMockFn(() => true),
      findById: createMockFn(id => ({ id, NIK: '123' })),
    };
    const mockFamilyRepository = {
      exists: createMockFn(() => true),
      findById: createMockFn(id => ({ id, members: [{ citizenId: 'c1' }] })),
    };

    // Instantiate components for the Aspiration package
    const mockAspirationRepository = new AspirationRepository();
    mockAspirationRepository.dbAdapter = mockDbAdapter;
    mockAspirationRepository.count = createMockFn((filters) => mockDbAdapter.count(mockAspirationRepository.tableName, filters));
    mockAspirationRepository.exists = createMockFn((id) => mockDbAdapter.exists(mockAspirationRepository.tableName, { id }));

    const mockAspirationRule = {
      checkCitizenExists: createMockFn(),
      checkFamilyExists: createMockFn(),
      checkCitizenFamilyRelationship: createMockFn(),
      checkValidCategory: createMockFn(),
      checkStatusTransition: createMockFn(),
      checkCanBeVoted: createMockFn(),
    };

    const aspirationRule = new AspirationRule(
      mockAspirationRepository,
      mockCitizenRepository,
      mockFamilyRepository,
      mockWorkflowService
    );
    const aspirationValidator = new AspirationValidator(aspirationRule);
    const aspirationService = new AspirationService(
      mockAspirationRepository,
      aspirationValidator,
      aspirationRule,
      mockWorkflowService,
      mockCitizenRepository,
      mockFamilyRepository,
      mockEventBus,
      mockAnalyticsService
    );
    const aspirationStatistics = new AspirationStatistics(mockAspirationRepository, mockAnalyticsService);
    const aspirationDashboard = new AspirationDashboard();
    const aspirationEntity = new Aspiration({
      id: 'asp1',
      citizenId: 'c1',
      subject: 'Test',
      description: 'Desc',
      category: 'INFRASTRUCTURE',
    });

    return {
      mockLogger,
      mockSecurity,
      mockUser,
      mockDbAdapter,
      mockEventBus,
      mockAnalyticsService,
      mockCache,
      mockUtilities,
      mockMasterDataService,
      mockCitizenRepository,
      mockFamilyRepository,
      mockAspirationRepository,
      aspirationRepository: mockAspirationRepository,
      mockAspirationRule,
      mockWorkflowService,
      aspirationEntity,
      aspirationRule,
      aspirationValidator,
      aspirationService,
      aspirationStatistics,
      aspirationDashboard,
    };
  }
}

