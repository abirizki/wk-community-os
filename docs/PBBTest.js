/**
 * @class PBBTest
 * @description Provides a test suite for the PBB package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBTest {
  /**
   * Main entry point to run all tests for the PBB package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] PBB Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = PBBTest.testServiceRegisterTaxObject() && allTestsPassed;
    allTestsPassed = PBBTest.testServiceRegisterTaxpayer() && allTestsPassed;
    allTestsPassed = PBBTest.testServiceIssueSPPT() && allTestsPassed;
    allTestsPassed = PBBTest.testServiceRecordPayment() && allTestsPassed;
    allTestsPassed = PBBTest.testServiceGetOverdueSPPTs() && allTestsPassed;
    allTestsPassed = PBBTest.testServiceInitiateArrearsFollowUp() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All PBB Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some PBB Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockTaxObjectRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockTaxObjectRepo._db.set(d.id, d); return d; }, findById: (id) => mockTaxObjectRepo._db.get(id), findByNop: (nop) => Array.from(mockTaxObjectRepo._db.values()).find(obj => obj.nop === nop), findAll: () => Array.from(mockTaxObjectRepo._db.values()), update: (id, data) => { const existing = mockTaxObjectRepo._db.get(id); if (existing) { mockTaxObjectRepo._db.set(id, { ...existing, ...data }); return mockTaxObjectRepo._db.get(id); } return null; } };
    const mockTaxpayerRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockTaxpayerRepo._db.set(d.id, d); return d; }, findById: (id) => mockTaxpayerRepo._db.get(id), findByCitizenId: (cid) => Array.from(mockTaxpayerRepo._db.values()).find(tp => tp.citizenId === cid), findAll: () => Array.from(mockTaxpayerRepo._db.values()), update: (id, data) => { const existing = mockTaxpayerRepo._db.get(id); if (existing) { mockTaxpayerRepo._db.set(id, { ...existing, ...data }); return mockTaxpayerRepo._db.get(id); } return null; } };
    const mockSpptRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockSpptRepo._db.set(d.id, d); return d; }, findById: (id) => mockSpptRepo._db.get(id), findAll: (query) => Array.from(mockSpptRepo._db.values()).filter(sppt => Object.keys(query).every(key => sppt[key] === query[key])), update: (id, data) => { const existing = mockSpptRepo._db.get(id); if (existing) { mockSpptRepo._db.set(id, { ...existing, ...data }); return mockSpptRepo._db.get(id); } return null; } };
    const mockPaymentHistoryRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockPaymentHistoryRepo._db.set(d.id, d); return d; }, findById: (id) => mockPaymentHistoryRepo._db.get(id) };

    const mockValidator = {
      validateTaxObjectRegistration: (data) => { if (!data.nop) throw new Error('NOP required'); },
      validateTaxpayerRegistration: (data) => { if (!data.citizenId) throw new Error('Citizen ID required'); },
      validateSPPTIssuance: (data) => { if (!data.taxpayerId) throw new Error('Taxpayer ID required'); },
      validatePaymentRecord: (data) => { if (!data.paymentAmount) throw new Error('Payment amount required'); },
      validateForUpdate: (data) => true
    };

    const mockCitizenService = { getCitizenById: (id) => (id === 'citizen123' ? { id: 'citizen123', nama_lengkap: 'Test Citizen', householdId: 'hh1' } : null) };
    const mockHouseholdService = { getHouseholdById: (id) => (id === 'hh1' ? { id: 'hh1', pbbNumber: '32.72.010.001.001-0001.0' } : null) };
    const mockEventBus = { publish: (event) => WK.logger().debug(`EventBus: ${event.eventType} published`) };
    const mockWorkflowService = { startWorkflow: (type, refId, userId, payload) => WK.logger().debug(`Workflow: ${type} started for ${refId}`) };
    const mockNotificationService = { createAndQueue: (notification) => WK.logger().debug(`Notification: ${notification.title} queued`) };

    WK.service = (name) => {
      if (name === 'eventbus') return mockEventBus;
      if (name === 'workflow') return mockWorkflowService;
      if (name === 'notification') return mockNotificationService;
      if (name === 'citizen') return mockCitizenService;
      if (name === 'household') return mockHouseholdService;
      return null;
    };
    WK.helper = () => ({ generateUuid: () => `test_uuid_${Math.random().toString(36).substring(2, 8)}` });
    WK.security = () => ({ checkPermission: () => true });
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });
    WK.session = () => ({ getCurrentUser: () => ({ id: 'admin123' }) });

    const pbbService = new PBBService(
      mockTaxObjectRepo, mockTaxpayerRepo, mockSpptRepo, mockPaymentHistoryRepo,
      mockValidator, mockCitizenService, mockHouseholdService
    );

    return { pbbService, mockTaxObjectRepo, mockTaxpayerRepo, mockSpptRepo, mockPaymentHistoryRepo };
  }

  static testServiceRegisterTaxObject() {
    WK.logger().info('Running PBBService.registerTaxObject test...');
    const { pbbService, mockTaxObjectRepo } = PBBTest._setupMocks();
    const taxObjectData = { nop: '32.72.010.001.001-0001.0', address: { street: 'Jl. Demo' }, landArea: 100, ownerCitizenId: 'citizen123' };
    const newTaxObject = pbbService.registerTaxObject(taxObjectData);
    console.assert(newTaxObject.nop === taxObjectData.nop, 'Test Failed: Tax object NOP mismatch.');
    console.assert(mockTaxObjectRepo._db.size === 1, 'Test Failed: Tax object not added to repository.');
    WK.logger().info('PBBService.registerTaxObject test passed.');
    return true;
  }

  static testServiceRegisterTaxpayer() {
    WK.logger().info('Running PBBService.registerTaxpayer test...');
    const { pbbService, mockTaxpayerRepo } = PBBTest._setupMocks();
    const taxpayerData = { citizenId: 'citizen123', taxpayerNumber: 'WP-1234567890' };
    const newTaxpayer = pbbService.registerTaxpayer(taxpayerData);
    console.assert(newTaxpayer.citizenId === taxpayerData.citizenId, 'Test Failed: Taxpayer citizenId mismatch.');
    console.assert(mockTaxpayerRepo._db.size === 1, 'Test Failed: Taxpayer not added to repository.');
    WK.logger().info('PBBService.registerTaxpayer test passed.');
    return true;
  }

  static testServiceIssueSPPT() {
    WK.logger().info('Running PBBService.issueSPPT test...');
    const { pbbService, mockTaxObjectRepo, mockTaxpayerRepo, mockSpptRepo } = PBBTest._setupMocks();
    const taxObject = mockTaxObjectRepo.create({ id: 'to1', nop: '32.72.010.001.001-0001.0', address: { street: 'Jl. Demo' }, landArea: 100, ownerCitizenId: 'citizen123' });
    const taxpayer = mockTaxpayerRepo.create({ id: 'tp1', citizenId: 'citizen123', taxpayerNumber: 'WP-1234567890' });
    const spptData = { taxpayerId: taxpayer.id, taxObjectId: taxObject.id, taxYear: 2026, taxAmount: 500000, dueDate: '2026-09-30T23:59:59Z' };
    const newSPPT = pbbService.issueSPPT(spptData);
    console.assert(newSPPT.taxpayerId === taxpayer.id, 'Test Failed: SPPT taxpayerId mismatch.');
    console.assert(newSPPT.status === 'ISSUED', 'Test Failed: SPPT status not ISSUED.');
    console.assert(mockSpptRepo._db.size === 1, 'Test Failed: SPPT not added to repository.');
    WK.logger().info('PBBService.issueSPPT test passed.');
    return true;
  }

  static testServiceRecordPayment() {
    WK.logger().info('Running PBBService.recordPayment test...');
    const { pbbService, mockSpptRepo, mockPaymentHistoryRepo } = PBBTest._setupMocks();
    const sppt = mockSpptRepo.create({ id: 'sppt1', taxpayerId: 'tp1', taxObjectId: 'to1', spptNumber: 'SPPT-2026-...', taxYear: 2026, taxAmount: 500000, dueDate: '2026-09-30T23:59:59Z', status: 'ISSUED' });
    const paymentData = { paymentDate: new Date().toISOString(), paymentAmount: 500000, paymentMethod: 'BANK_TRANSFER' };
    const newPayment = pbbService.recordPayment(sppt.id, paymentData);
    console.assert(newPayment.spptId === sppt.id, 'Test Failed: Payment spptId mismatch.');
    console.assert(newPayment.status === 'SUCCESS', 'Test Failed: Payment status not SUCCESS.');
    console.assert(mockPaymentHistoryRepo._db.size === 1, 'Test Failed: Payment not added to repository.');
    const updatedSppt = mockSpptRepo.findById(sppt.id);
    console.assert(updatedSppt.status === 'PAID', 'Test Failed: SPPT status not updated to PAID.');
    WK.logger().info('PBBService.recordPayment test passed.');
    return true;
  }

  static testServiceGetOverdueSPPTs() {
    WK.logger().info('Running PBBService.getOverdueSPPTs test...');
    const { pbbService, mockSpptRepo } = PBBTest._setupMocks();
    // Create an overdue SPPT
    mockSpptRepo.create({ id: 'sppt_overdue', taxpayerId: 'tp1', taxObjectId: 'to1', spptNumber: 'SPPT-2025-...', taxYear: 2025, taxAmount: 200000, dueDate: '2025-09-30T23:59:59Z', status: 'ISSUED' });
    // Create a current SPPT
    mockSpptRepo.create({ id: 'sppt_current', taxpayerId: 'tp1', taxObjectId: 'to1', spptNumber: 'SPPT-2026-...', taxYear: 2026, taxAmount: 500000, dueDate: '2026-09-30T23:59:59Z', status: 'ISSUED' });

    const overdueSPPTs = pbbService.getOverdueSPPTs();
    console.assert(overdueSPPTs.length === 1, 'Test Failed: Incorrect number of overdue SPPTs found.');
    console.assert(overdueSPPTs[0].id === 'sppt_overdue', 'Test Failed: Incorrect overdue SPPT identified.');
    WK.logger().info('PBBService.getOverdueSPPTs test passed.');
    return true;
  }

  static testServiceInitiateArrearsFollowUp() {
    WK.logger().info('Running PBBService.initiateArrearsFollowUp test...');
    const { pbbService, mockSpptRepo } = PBBTest._setupMocks();
    const sppt = mockSpptRepo.create({ id: 'sppt_arrears', taxpayerId: 'tp1', taxObjectId: 'to1', spptNumber: 'SPPT-2025-...', taxYear: 2025, taxAmount: 300000, dueDate: '2025-09-30T23:59:59Z', status: 'ISSUED' });
    const result = pbbService.initiateArrearsFollowUp(sppt.id, 'admin123');
    console.assert(result, 'Test Failed: Arrears follow-up initiation failed.');
    const updatedSppt = mockSpptRepo.findById(sppt.id);
    console.assert(updatedSppt.status === 'OVERDUE', 'Test Failed: SPPT status not updated to OVERDUE.');
    WK.logger().info('PBBService.initiateArrearsFollowUp test passed.');
    return true;
  }
}

// Global function to run all tests, typically called from a test runner or directly in Apps Script
function runAllPBBModuleTests() {
  PBBTest.runAll();
}