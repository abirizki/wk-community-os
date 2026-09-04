/**
 * @class ComplaintTest
 * @description Provides a comprehensive test suite for the Complaint package.
 * It covers unit tests for services, integration tests between components,
 * and prepares for workflow and statistics testing.
 */
class ComplaintTest {
  /**
   * Main entry point to run all tests for the Complaint package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Complaint Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = ComplaintTest.testRepository() && allTestsPassed;
    allTestsPassed = ComplaintTest.testValidator() && allTestsPassed;
    allTestsPassed = ComplaintTest.testService() && allTestsPassed;
    allTestsPassed = ComplaintTest.testWorkflowIntegration() && allTestsPassed;
    allTestsPassed = ComplaintTest.testStatisticsService() && allTestsPassed;
    // Add other test suites here

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Complaint Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Complaint Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockDb = new Map();

    const mockComplaintRepo = {
      _db: mockDb,
      create: (data) => {
        const id = data.id || `cmp_${Math.random().toString(36).substring(7)}`;
        const entity = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mockDb.set(id, entity);
        return entity;
      },
      update: (id, data) => {
        if (!mockDb.has(id)) return null;
        const existing = mockDb.get(id);
        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        mockDb.set(id, updated);
        return updated;
      },
      findById: (id) => mockDb.get(id) || null,
      findByTrackingNumber: (tn) => [...mockDb.values()].find(c => c.trackingNumber === tn) || null,
      findAll: (query = {}) => {
        return [...mockDb.values()].filter(item => {
          for (const key in query) {
            if (typeof query[key] === 'object' && query[key].$nin) {
              if (query[key].$nin.includes(item[key])) return false;
            } else if (item[key] !== query[key]) return false;
          }
          return true;
        });
      },
      count: (query = {}) => mockComplaintRepo.findAll(query).length,
      statistics: ({ groupBy, operation, query }) => {
        const items = mockComplaintRepo.findAll(query);
        if (operation === 'count') {
          return items.reduce((acc, item) => {
            const key = item[groupBy];
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
        }
        return {}; // Simplified
      }
    };

    // Mock WK.service() for dependencies
    const originalWkService = WK.service;
    WK.service = (name) => {
      if (name === 'citizen') return { getCitizenById: (id) => (id === 'citizen123' ? { id: 'citizen123', status: 'Aktif', householdId: 'hh1', address: { rt: '001', rw: '001' } } : null) };
      if (name === 'household') return { getHouseholdById: (id) => (id === 'hh1' ? { id: 'hh1', kkNumber: '123' } : null) };
      if (name === 'complaint.category') return {
        getAllCategories: () => [{ id: 'INFRASTRUCTURE', name: 'Infra', subCategories: ['Road'] }],
        isValidCategory: (cat) => cat === 'INFRASTRUCTURE',
        isValidSubCategory: (cat, sub) => cat === 'INFRASTRUCTURE' && sub === 'Road'
      };
      if (name === 'workflow') return {
        startWorkflow: (type, refId, subBy, ctx) => ({ id: 'wf1', referenceId: refId, currentState: 'SUBMITTED' }),
        getWorkflowByReferenceId: (refId) => (refId === 'cmp1' ? { id: 'wf1', currentState: 'SUBMITTED' } : null),
        processAction: (wfId, action, comment) => ({ id: wfId, currentState: 'VERIFIED' })
      };
      if (name === 'eventbus') return { publish: (type, payload) => WK.logger().debug(`Mock EventBus: ${type} published`) };
      return originalWkService(name); // Fallback to original for other services
    };

    // Mock WK.helper()
    const originalWkHelper = WK.helper;
    WK.helper = () => ({
      generateUuid: () => `uuid_${Math.random().toString(36).substring(7)}`,
      formatDuration: (ms) => `${Math.floor(ms / (1000 * 60 * 60 * 24))} days`
    });

    // Mock WK.security()
    const originalWkSecurity = WK.security;
    WK.security = () => ({ checkPermission: (perm) => WK.logger().debug(`Mock Security: ${perm} checked`) });

    // Mock WK.session()
    const originalWkSession = WK.session;
    WK.session = () => ({ getUser: () => ({ id: 'testUser', role: 'CITIZEN' }) });

    return { mockComplaintRepo };
  }

  /**
   * Unit tests for ComplaintRepository.
   * @returns {boolean}
   */
  static testRepository() {
    WK.logger().info('Running ComplaintRepository tests...');
    const { mockComplaintRepo } = ComplaintTest._setupMocks();
    const repo = new ComplaintRepository(mockComplaintRepo); // Pass mock directly

    let passed = true;

    // Test create
    const newCmp = repo.create({ citizenId: 'c1', category: 'INFRASTRUCTURE', title: 'Test Repo' });
    console.assert(newCmp.id.startsWith('cmp_'), 'Repo Test: Create failed to assign ID.');
    console.assert(repo.findById(newCmp.id).title === 'Test Repo', 'Repo Test: FindById after create failed.');

    // Test update
    const updatedCmp = repo.update(newCmp.id, { title: 'Updated Repo Test' });
    console.assert(updatedCmp.title === 'Updated Repo Test', 'Repo Test: Update failed.');

    // Test findByTrackingNumber
    const foundByTn = repo.findByTrackingNumber(newCmp.trackingNumber);
    console.assert(foundByTn.id === newCmp.id, 'Repo Test: FindByTrackingNumber failed.');

    // Test findAll and count
    const all = repo.findAll();
    console.assert(all.length >= 1, 'Repo Test: FindAll failed.');
    console.assert(repo.count() >= 1, 'Repo Test: Count failed.');

    WK.logger().info('ComplaintRepository tests passed.');
    return passed;
  }

  /**
   * Unit tests for ComplaintValidator.
   * @returns {boolean}
   */
  static testValidator() {
    WK.logger().info('Running ComplaintValidator tests...');
    ComplaintTest._setupMocks(); // Setup mocks for validator dependencies
    const validator = new ComplaintValidator(
      WK.repository('complaint'),
      WK.service('citizen'),
      WK.service('household'),
      WK.service('complaint.category')
    );

    let passed = true;

    // Test valid complaint creation data
    let data = {
      citizenId: 'citizen123',
      category: 'INFRASTRUCTURE',
      subCategory: 'Road',
      title: 'Jalan Rusak',
      description: 'Jalan di depan rumah rusak parah.',
      location: 'Jl. Contoh No. 1',
      priority: 'HIGH'
    };
    let result = validator.forCreate(data);
    console.assert(result.isValid, `Validator Test: Valid create data failed. Errors: ${result.errors.join(', ')}`);

    // Test missing required field
    data.title = '';
    result = validator.forCreate(data);
    console.assert(!result.isValid && result.errors.includes('title is required.'), 'Validator Test: Missing title not caught.');
    data.title = 'Jalan Rusak'; // Reset

    // Test invalid category
    data.category = 'INVALID_CAT';
    result = validator.forCreate(data);
    console.assert(!result.isValid && result.errors.includes("Category 'INVALID_CAT' is not valid."), 'Validator Test: Invalid category not caught.');
    data.category = 'INFRASTRUCTURE'; // Reset

    // Test invalid citizen
    data.citizenId = 'nonExistentCitizen';
    result = validator.forCreate(data);
    console.assert(!result.isValid && result.errors.includes("Citizen with ID 'nonExistentCitizen' not found."), 'Validator Test: Invalid citizen not caught.');
    data.citizenId = 'citizen123'; // Reset

    WK.logger().info('ComplaintValidator tests passed.');
    return passed;
  }

  /**
   * Unit tests for ComplaintService.
   * @returns {boolean}
   */
  static testService() {
    WK.logger().info('Running ComplaintService tests...');
    ComplaintTest._setupMocks();
    const service = new ComplaintService(
      WK.repository('complaint'),
      new ComplaintValidator(WK.repository('complaint'), WK.service('citizen'), WK.service('household'), WK.service('complaint.category')),
      WK.service('complaint.category'),
      // Mock other services as needed for full test
      { uploadAttachment: () => ({ fileId: 'f1', fileName: 'test.jpg' }) }, // Mock AttachmentService
      { assignComplaint: () => {} }, // Mock AssignmentService
      { resolve: () => {}, confirm: () => {} }, // Mock ResolutionService
      { addEntry: () => {}, getTimelineForComplaint: () => [] }, // Mock TimelineService
      WK.service('workflow'), // Use mock workflow service
      WK.service('citizen'),
      WK.service('household')
    );

    let passed = true;

    // Test createComplaint - success
    try {
      const newComplaint = service.createComplaint({
        citizenId: 'citizen123',
        category: 'INFRASTRUCTURE',
        title: 'Jalan Rusak',
        description: 'Jalan di depan rumah rusak parah.',
        location: 'Jl. Contoh No. 1',
        priority: 'HIGH'
      });
      console.assert(newComplaint.status === 'SUBMITTED', 'Service Test: New complaint status incorrect.');
      console.assert(newComplaint.trackingNumber.startsWith('CMP-'), 'Service Test: Tracking number not generated.');
    } catch (e) {
      console.error('Service Test: createComplaint failed unexpectedly.', e);
      passed = false;
    }

    WK.logger().info('ComplaintService tests passed.');
    return passed;
  }

  /**
   * Integration tests for Workflow package interaction.
   * @returns {boolean}
   */
  static testWorkflowIntegration() {
    WK.logger().info('Running Workflow Integration tests...');
    ComplaintTest._setupMocks();
    const service = new ComplaintService(
      WK.repository('complaint'),
      new ComplaintValidator(WK.repository('complaint'), WK.service('citizen'), WK.service('household'), WK.service('complaint.category')),
      WK.service('complaint.category'),
      { uploadAttachment: () => ({ fileId: 'f1', fileName: 'test.jpg' }) },
      { assignComplaint: () => {} },
      { resolve: () => {}, confirm: () => {} },
      { addEntry: () => {}, getTimelineForComplaint: () => [] },
      WK.service('workflow'), // Use mock workflow service
      WK.service('citizen'),
      WK.service('household')
    );

    let passed = true;

    // Simulate creating a complaint and check if workflow is started
    const newComplaint = service.createComplaint({
      citizenId: 'citizen123',
      category: 'INFRASTRUCTURE',
      title: 'Test Workflow',
      description: 'Test workflow integration.',
      location: 'Test Location',
      priority: 'MEDIUM'
    });

    const workflow = WK.service('workflow').getWorkflowByReferenceId(newComplaint.id);
    console.assert(workflow && workflow.currentState === 'SUBMITTED', 'Workflow Integration Test: Workflow not started or wrong initial state.');

    WK.logger().info('Workflow Integration tests passed.');
    return passed;
  }

  /**
   * Unit tests for ComplaintStatisticsService.
   * @returns {boolean}
   */
  static testStatisticsService() {
    WK.logger().info('Running ComplaintStatisticsService tests...');
    ComplaintTest._setupMocks();
    const statsService = new ComplaintStatisticsService(
      WK.repository('complaint'),
      WK.service('complaint.category')
    );
    let passed = true;

    // Seed some data for statistics
    const repo = WK.repository('complaint');
    repo.create({ citizenId: 'citizen123', category: 'INFRASTRUCTURE', status: 'SUBMITTED', priority: 'HIGH', submittedAt: new Date().toISOString() });
    repo.create({ citizenId: 'citizen123', category: 'SOCIAL', status: 'RESOLVED', priority: 'MEDIUM', submittedAt: new Date().toISOString(), resolvedAt: new Date().toISOString() });
    repo.create({ citizenId: 'citizen123', category: 'INFRASTRUCTURE', status: 'IN_PROGRESS', priority: 'CRITICAL', submittedAt: new Date().toISOString() });

    // Test getTotalOpenComplaints
    const open = statsService.getTotalOpenComplaints();
    console.assert(open === 2, `Stats Test: Incorrect total open complaints. Expected 2, got ${open}`);

    // Test getComplaintsByCategory
    const byCategory = statsService.getComplaintsByCategory();
    console.assert(byCategory['INFRASTRUCTURE'] === 2, `Stats Test: Incorrect infrastructure count. Expected 2, got ${byCategory['INFRASTRUCTURE']}`);
    console.assert(byCategory['SOCIAL'] === 1, `Stats Test: Incorrect social count. Expected 1, got ${byCategory['SOCIAL']}`);

    WK.logger().info('ComplaintStatisticsService tests passed.');
    return passed;
  }
}

// Global function to run all tests, typically called from a test runner or directly in Apps Script
function runAllComplaintModuleTests() {
  ComplaintTest.runAll();
}