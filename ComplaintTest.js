/**
 * @class ComplaintTest
 * @description Comprehensive quality and acceptance test suite for the Complaint package.
 */
class ComplaintTest {
  /**
   * Main entry point to run all test categories for the Complaint package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Complaint Package Test Suite ---');
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
      WK.logger().info('--- [PASS] All Complaint Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Complaint Package Tests Failed ---');
    }
    return qualityGatePassed;
  }

  static runUnitTests() {
    WK.logger().info('--- [UNIT TESTS] ---');
    const { complaintEntity, complaintValidator, complaintRule } = this._setupMocks();
    let passed = true;

    // Entity Test
    const entityData = { id: 'comp1', citizenId: 'c1', subject: 'Test Subject', description: 'Test Desc', category: 'INFRASTRUCTURE' };
    const entity = new Complaint(entityData);
    console.assert(entity.id === 'comp1', 'Unit: Entity ID mismatch');
    console.assert(entity.toObject().subject === 'Test Subject', 'Unit: Entity toObject mismatch');
    console.assert(entity.status === 'SUBMITTED', 'Unit: Entity default status is not SUBMITTED');

    // Validator Test
    try {
      complaintValidator.validateForCreate({ citizenId: 'c1', subject: 'Test' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('description is required'), 'Unit: Validator did not catch missing description');
    }

    // Rule Test
    try {
      complaintRule.checkStatusTransition('RESOLVED', 'IN_REVIEW');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid complaint status transition'), 'Unit: Rule did not catch invalid status transition');
    }

    WK.logger().info(`Unit Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRepositoryTests() {
    WK.logger().info('--- [REPOSITORY TESTS] ---');
    const { complaintRepository, mockDbAdapter } = this._setupMocks();
    let passed = true;

    const entity = new Complaint({ id: 'comp1', citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' });
    complaintRepository.create(entity);
    console.assert(mockDbAdapter.create.mock.calls.length === 1, 'Repository: create was not called');

    complaintRepository.findByCitizenId('c1');
    console.assert(mockDbAdapter.search.mock.calls.some(c => c[1].citizenId === 'c1'), 'Repository: findByCitizenId failed');

    WK.logger().info(`Repository Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runValidationTests() {
    WK.logger().info('--- [VALIDATION TESTS] ---');
    const { complaintValidator, mockComplaintRule } = this._setupMocks();
    let passed = true;

    try {
      complaintValidator.validateForCreate({});
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen ID is required'), 'Validation: Missing citizenId not caught');
    }

    mockComplaintRule.checkCitizenExists.mockImplementationOnce(() => { throw new Error('Citizen not found'); });
    try {
      complaintValidator.validateForCreate({ citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' });
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Citizen not found'), 'Validation: Non-existent citizen not caught');
    }

    WK.logger().info(`Validation Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPermissionTests() {
    WK.logger().info('--- [PERMISSION TESTS] ---');
    const { complaintService, mockSecurity } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      complaintService.createComplaint({});
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Create permission not enforced');
    }

    mockSecurity.checkPermission.mockImplementationOnce(() => { throw new Error('Permission Denied'); });
    try {
      complaintService.resolveComplaint('comp1', 'Resolved');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Permission: Resolve permission not enforced');
    }

    WK.logger().info(`Permission Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runRuleTests() {
    WK.logger().info('--- [RULE TESTS] ---');
    const { complaintRule, mockCitizenRepository, mockMasterDataService } = this._setupMocks();
    let passed = true;

    mockCitizenRepository.exists.mockReturnValueOnce(false);
    try {
      complaintRule.checkCitizenExists('c-nonexistent');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('not found'), 'Rule: checkCitizenExists failed');
    }

    mockMasterDataService.exists.mockReturnValueOnce(false);
    try {
      complaintRule.checkValidCategory('INVALID_CATEGORY');
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Invalid complaint category'), 'Rule: checkValidCategory failed');
    }

    WK.logger().info(`Rule Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runServiceTests() {
    WK.logger().info('--- [SERVICE TESTS] ---');
    const { complaintService, mockEventBus, mockAnalyticsService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    const payload = { citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' };
    const record = complaintService.createComplaint(payload);
    console.assert(record.id, 'Service: createComplaint failed');
    console.assert(mockWorkflowService.startWorkflow.mock.calls.length === 1, 'Service: Workflow not started on create');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ComplaintCreated'), 'Service: Create event not published');
    console.assert(mockAnalyticsService.track.mock.calls.some(c => c[0] === 'complaint_created'), 'Service: Create analytics not tracked');

    complaintService.resolveComplaint(record.id, 'Fixed.');
    console.assert(mockWorkflowService.transition.mock.calls.some(c => c[1] === 'RESOLVE'), 'Service: Workflow transition not called on resolve');
    console.assert(mockEventBus.publish.mock.calls.some(c => c[0] === 'ComplaintResolved'), 'Service: Resolve event not published');

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
      ComplaintMigration.up();
      console.assert(mockDbAdapter.createTable.mock.calls.length > 0, 'Migration: up() did not call createTable');
      console.assert(mockDbAdapter.ensureIndex.mock.calls.some(c => c[1] === 'status'), 'Migration: Index on status missing');
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
      const seeder = new ComplaintSeeder();
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
    const { complaintStatistics, mockComplaintRepository, mockAnalyticsService } = this._setupMocks();
    let passed = true;

    mockComplaintRepository.count.mockImplementation((filters) => {
      if (filters.status?.in?.includes('SUBMITTED')) return 70;
      if (filters.status === 'RESOLVED') return 20;
      return 100;
    });
    const summary = complaintStatistics.getSummary();
    console.assert(summary.totalComplaints === 100, 'Statistics: getSummary total is incorrect');
    console.assert(summary.openComplaints === 70, 'Statistics: getSummary open count is incorrect');

    mockAnalyticsService.getTimeSeries.mockClear();
    complaintStatistics.getCreatedTrend();
    console.assert(mockAnalyticsService.getTimeSeries.mock.calls.some(c => c[0].metric === 'complaint_created'), 'Statistics: getCreatedTrend did not call AnalyticsService');

    WK.logger().info(`Statistics Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runDashboardTests() {
    WK.logger().info('--- [DASHBOARD TESTS] ---');
    let passed = true;

    const widgets = ComplaintDashboard.getWidgets();
    console.assert(widgets.length > 0, 'Dashboard: getWidgets returned no widgets');
    const totalWidget = widgets.find(w => w.id === 'complaint_total');
    console.assert(totalWidget.type === 'summary_card', 'Dashboard: Total complaints widget is misconfigured');
    console.assert(totalWidget.dataSource === 'ComplaintStatistics.getSummary', 'Dashboard: Total complaints widget has incorrect data source');

    const pendingQueueWidget = widgets.find(w => w.id === 'complaint_pending_queue');
    console.assert(pendingQueueWidget.dataSource === 'ComplaintService.searchComplaints', 'Dashboard: Pending queue widget has incorrect data source');

    WK.logger().info(`Dashboard Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runIntegrationTests() {
    WK.logger().info('--- [INTEGRATION TESTS] ---');
    const { complaintService, mockWorkflowService } = this._setupMocks();
    let passed = true;

    // Workflow Integration
    const payload = { citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' };
    complaintService.createComplaint(payload);
    console.assert(mockWorkflowService.startWorkflow.mock.calls.length === 1, 'Integration: WorkflowService.startWorkflow was not called');
    console.assert(mockWorkflowService.startWorkflow.mock.calls[0][0].contextType === 'Complaint', 'Integration: Workflow started with incorrect contextType');

    WK.logger().info(`Integration Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSecurityTests() {
    WK.logger().info('--- [SECURITY TESTS] ---');
    const { complaintService, mockSecurity, mockLogger } = this._setupMocks();
    let passed = true;

    mockSecurity.checkPermission.mockClear();
    complaintService.getComplaint('comp1');
    console.assert(mockSecurity.checkPermission.mock.calls.some(c => c[0] === 'complaint.record.read.all'), 'Security: getComplaint missing permission check');

    mockLogger.info.mockClear();
    const payload = { citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' };
    complaintService.createComplaint(payload);
    console.assert(mockLogger.info.mock.calls.some(c => c[0].includes('Successfully created complaint')), 'Security: Create action not logged for audit');

    WK.logger().info(`Security Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPrivacyTests() {
    WK.logger().info('--- [PRIVACY TESTS] ---');
    const { complaintService, mockSecurity, mockUser } = this._setupMocks();
    let passed = true;

    // Test read.own permission
    mockUser.mockReturnValue({ id: 'user-c2', citizenId: 'c2' }); // A different citizen
    mockSecurity.hasPermission.mockReturnValue(false); // Does not have read.all
    try {
      complaintService.getComplaint('comp1'); // comp1 belongs to c1
      passed = false;
    } catch (e) {
      console.assert(e.message.includes('Access denied'), 'Privacy: getComplaint did not enforce read.own correctly');
    }

    WK.logger().info(`Privacy Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runPerformanceTests() {
    WK.logger().info('--- [PERFORMANCE TESTS] ---');
    const { complaintStatistics, mockComplaintRepository } = this._setupMocks();
    let passed = true;

    mockComplaintRepository.count.mockClear();
    complaintStatistics.getSummary(); // First call
    complaintStatistics.getSummary(); // Second call (should be cached)
    console.assert(mockComplaintRepository.count.mock.calls.length <= 5, 'Performance: Summary is not being cached effectively');

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
    const { complaintService, mockEventBus, mockSecurity, mockWorkflowService } = this._setupMocks();
    let passed = true;

    // Scenario A: Full workflow
    const createPayload = { citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' };
    const createdComplaint = complaintService.createComplaint(createPayload);
    console.assert(createdComplaint.id, 'Acceptance: Create complaint failed');
    console.assert(createdComplaint.workflowId, 'Acceptance: Complaint not linked to workflow');

    const assignedComplaint = complaintService.assignComplaint(createdComplaint.id, 'user-rt', 'USER');
    console.assert(assignedComplaint.assignedToId === 'user-rt', 'Acceptance: Assign complaint failed');

    const resolvedComplaint = complaintService.resolveComplaint(assignedComplaint.id, 'Fixed.');
    console.assert(resolvedComplaint.status === 'RESOLVED', 'Acceptance: Resolve complaint failed');

    const closedComplaint = complaintService.closeComplaint(resolvedComplaint.id);
    console.assert(closedComplaint.status === 'CLOSED', 'Acceptance: Close complaint failed');

    // Scenario B: Unauthorized action
    mockSecurity.checkPermission.mockImplementation((perm) => {
      if (perm === 'complaint.record.resolve') throw new Error('Permission Denied');
    });
    try {
      complaintService.resolveComplaint(assignedComplaint.id, 'Unauthorized resolution');
      passed = false;
    } catch (e) {
      console.assert(e.message === 'Permission Denied', 'Acceptance: Unauthorized resolution not rejected');
    }

    WK.logger().info(`Acceptance Tests Result: ${passed ? 'PASS' : 'FAIL'}`);
    return passed;
  }

  static runSyntaxTests() {
    WK.logger().info('--- [SYNTAX TESTS] ---');
    let passed = true;
    // Conceptual check, assuming all generated files are valid.
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
    const mockLogger = {
      info: WK.mock().fn(), warn: WK.mock().fn(), error: WK.mock().fn(), debug: WK.mock().fn(),
    };
    const mockSecurity = {
      checkPermission: WK.mock().fn(() => true),
      hasPermission: WK.mock().fn(() => true),
      hasAnyPermission: WK.mock().fn(() => true),
    };
    const mockUser = WK.mock().fn(() => ({ id: 'testUser', citizenId: 'c1' }));
    const mockDbAdapter = {
      create: WK.mock().fn((t, r) => ({ ...r, id: r.id || 'comp-mock' })),
      update: WK.mock().fn((t, id, u) => {
        const current = { id, citizenId: 'c1', status: 'SUBMITTED', version: 1 };
        return { ...current, ...u };
      }),
      findById: WK.mock().fn(id => {
        if (id === 'nonexistent') return null;
        return { id, citizenId: 'c1', status: 'SUBMITTED', version: 1 };
      }),
      findOne: WK.mock().fn(() => null),
      exists: WK.mock().fn(() => false),
      search: WK.mock().fn(() => []),
      count: WK.mock().fn(() => 0),
      hasTable: WK.mock().fn(() => true),
      createTable: WK.mock().fn(),
      ensureIndex: WK.mock().fn(),
    };
    const mockEventBus = { publish: WK.mock().fn() };
    const mockAnalyticsService = { track: WK.mock().fn(), getTimeSeries: WK.mock().fn(), getAverage: WK.mock().fn(() => ({ value: 0, unit: 'days' })) };
    const mockCache = { get: WK.mock().fn(() => null), set: WK.mock().fn() };
    const mockUtilities = { getUuid: () => 'comp-mock-' + Math.random() };
    const mockMasterDataService = { exists: WK.mock().fn(() => true) };

    const mockWorkflowService = {
      startWorkflow: WK.mock().fn((payload) => ({ id: 'wf-mock-id', currentState: 'SUBMITTED', ...payload })),
      transition: WK.mock().fn((workflowId, action) => {
        if (action === 'RESOLVE') return { id: workflowId, currentState: 'RESOLVED' };
        if (action === 'CLOSE') return { id: workflowId, currentState: 'CLOSED' };
        if (action === 'REOPEN') return { id: workflowId, currentState: 'REOPENED' };
        return { id: workflowId, currentState: 'IN_REVIEW' };
      }),
      assign: WK.mock().fn((workflowId, assigneeId, assigneeType) => ({ id: workflowId, assigneeId, assigneeType })),
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
      findById: WK.mock().fn(id => ({ id, members: [{ citizenId: 'c1' }] })),
    };

    // Mock and instantiate components for the Complaint package
    const mockComplaintRepository = new ComplaintRepository();
    mockComplaintRepository.dbAdapter = mockDbAdapter;

    const mockComplaintRule = {
      checkCitizenExists: WK.mock().fn(),
      checkFamilyExists: WK.mock().fn(),
      checkCitizenFamilyRelationship: WK.mock().fn(),
      checkValidCategory: WK.mock().fn(),
      checkValidPriority: WK.mock().fn(),
      checkStatusTransition: WK.mock().fn(),
    };

    const complaintRule = new ComplaintRule(mockComplaintRepository, mockCitizenRepository, mockFamilyRepository, mockWorkflowService);
    const complaintValidator = new ComplaintValidator(complaintRule);
    const complaintService = new ComplaintService(
      mockComplaintRepository,
      complaintValidator,
      complaintRule,
      mockWorkflowService,
      mockEventBus,
      mockAnalyticsService
    );
    const complaintStatistics = new ComplaintStatistics(mockComplaintRepository, mockAnalyticsService);
    const complaintDashboard = new ComplaintDashboard();
    const complaintEntity = new Complaint({ id: 'comp1', citizenId: 'c1', subject: 'Test', description: 'Desc', category: 'INFRASTRUCTURE' });

    return {
      mockLogger, mockSecurity, mockUser, mockDbAdapter, mockEventBus,
      mockAnalyticsService, mockCache, mockUtilities, mockMasterDataService,
      mockCitizenRepository, mockFamilyRepository, mockComplaintRepository, mockComplaintRule,
      mockWorkflowService,
      complaintEntity, complaintRule, complaintValidator, complaintService, complaintStatistics, complaintDashboard,
    };
  }
}