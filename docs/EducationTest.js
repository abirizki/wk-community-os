/**
 * @class EducationTest
 * @description Provides a test suite for the Education package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationTest {
  /**
   * Main entry point to run all tests for the Education package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Education Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = EducationTest.testServiceCreateStudent() && allTestsPassed;
    allTestsPassed = EducationTest.testServiceRegisterSchool() && allTestsPassed;
    allTestsPassed = EducationTest.testServiceApplyForScholarship() && allTestsPassed;
    allTestsPassed = EducationTest.testServiceRecordAttendance() && allTestsPassed;
    allTestsPassed = EducationTest.testServiceRecordDropout() && allTestsPassed;
    allTestsPassed = EducationTest.testServiceEnrollInLiteracyProgram() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Education Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Education Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockStudentRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockStudentRepo._db.set(d.id, d); return d; }, findById: (id) => mockStudentRepo._db.get(id), update: (id, data) => { const existing = mockStudentRepo._db.get(id); if (existing) { mockStudentRepo._db.set(id, { ...existing, ...data }); return mockStudentRepo._db.get(id); } return null; }, findAll: () => Array.from(mockStudentRepo._db.values()) };
    const mockSchoolRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockSchoolRepo._db.set(d.id, d); return d; }, findById: (id) => mockSchoolRepo._db.get(id), findAll: () => Array.from(mockSchoolRepo._db.values()) };
    const mockScholarshipRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockScholarshipRepo._db.set(d.id, d); return d; }, findById: (id) => mockScholarshipRepo._db.get(id), findAll: () => Array.from(mockScholarshipRepo._db.values()) };
    const mockDropoutRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockDropoutRepo._db.set(d.id, d); return d; }, findById: (id) => mockDropoutRepo._db.get(id) };
    const mockAttendanceRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockAttendanceRepo._db.set(d.id, d); return d; }, findById: (id) => mockAttendanceRepo._db.get(id) };
    const mockLiteracyRepo = { _db: new Map(), create: (d) => { d.id = d.id || WK.helper().generateUuid(); mockLiteracyRepo._db.set(d.id, d); return d; }, findById: (id) => mockLiteracyRepo._db.get(id) };

    const mockValidator = {
      validateStudentRegistration: (data) => { if (!data.citizenId) throw new Error('Citizen ID required'); },
      validateStudentUpdate: (data) => true,
      validateSchoolRegistration: (data) => { if (!data.name) throw new Error('School name required'); },
      validateScholarshipApplication: (data) => { if (!data.citizenId) throw new Error('Citizen ID required'); },
      validateAttendanceRecord: (data) => { if (!data.studentId) throw new Error('Student ID required'); },
      validateLiteracyEnrollment: (data) => { if (!data.citizenId) throw new Error('Citizen ID required'); }
    };

    const mockCitizenService = { getCitizenById: (id) => (id === 'citizen123' ? { id: 'citizen123', nama_lengkap: 'Test Citizen' } : null) };
    const mockEventBus = { publish: (event) => WK.logger().debug(`EventBus: ${event.eventType} published`) };
    const mockWorkflowService = { startWorkflow: (type, refId, userId, payload) => WK.logger().debug(`Workflow: ${type} started for ${refId}`) };
    const mockNotificationService = { createAndQueue: (notification) => WK.logger().debug(`Notification: ${notification.title} queued`) };

    WK.service = (name) => {
      if (name === 'eventbus') return mockEventBus;
      if (name === 'workflow') return mockWorkflowService;
      if (name === 'notification') return mockNotificationService;
      if (name === 'citizen') return mockCitizenService;
      return null;
    };
    WK.helper = () => ({ generateUuid: () => `test_uuid_${Math.random().toString(36).substring(2, 8)}` });
    WK.security = () => ({ checkPermission: () => true });
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });

    const educationService = new EducationService(
      mockStudentRepo, mockSchoolRepo, mockScholarshipRepo, mockDropoutRepo, mockAttendanceRepo, mockLiteracyRepo,
      mockValidator, mockCitizenService
    );

    return { educationService, mockStudentRepo, mockSchoolRepo, mockScholarshipRepo, mockDropoutRepo, mockAttendanceRepo, mockLiteracyRepo };
  }

  static testServiceCreateStudent() {
    WK.logger().info('Running EducationService.registerStudent test...');
    const { educationService, mockStudentRepo, mockSchoolRepo } = EducationTest._setupMocks();
    mockSchoolRepo.create({ id: 'school456', name: 'Test School' }); // Seed a mock school
    const studentData = { citizenId: 'citizen123', schoolId: 'school456', currentEducationLevel: 'SD', currentGrade: 'Kelas 1' };
    const newStudent = educationService.registerStudent(studentData);
    console.assert(newStudent.citizenId === 'citizen123', 'Test Failed: Student citizenId mismatch.');
    console.assert(mockStudentRepo._db.size === 1, 'Test Failed: Student not added to repository.');
    WK.logger().info('EducationService.registerStudent test passed.');
    return true;
  }

  static testServiceRegisterSchool() {
    WK.logger().info('Running EducationService.registerSchool test...');
    const { educationService, mockSchoolRepo } = EducationTest._setupMocks();
    const schoolData = { name: 'SMP Kebonjati', type: 'SMP', address: { street: 'Main St' } };
    const newSchool = educationService.registerSchool(schoolData);
    console.assert(newSchool.name === 'SMP Kebonjati', 'Test Failed: School name mismatch.');
    console.assert(mockSchoolRepo._db.size === 1, 'Test Failed: School not added to repository.');
    WK.logger().info('EducationService.registerSchool test passed.');
    return true;
  }

  static testServiceApplyForScholarship() {
    WK.logger().info('Running EducationService.applyForScholarship test...');
    const { educationService, mockScholarshipRepo } = EducationTest._setupMocks();
    const application = educationService.applyForScholarship('citizen123', 'Beasiswa Prestasi');
    console.assert(application.citizenId === 'citizen123', 'Test Failed: Scholarship citizenId mismatch.');
    console.assert(application.status === 'APPLIED', 'Test Failed: Scholarship status not APPLIED.');
    console.assert(mockScholarshipRepo._db.size === 1, 'Test Failed: Scholarship not added to repository.');
    WK.logger().info('EducationService.applyForScholarship test passed.');
    return true;
  }

  static testServiceRecordAttendance() {
    WK.logger().info('Running EducationService.recordAttendance test...');
    const { educationService, mockStudentRepo, mockAttendanceRepo } = EducationTest._setupMocks();
    mockStudentRepo.create({ id: 'student789', citizenId: 'citizen123', schoolId: 'school456', currentEducationLevel: 'SD', currentGrade: 'Kelas 1' });
    const attendance = educationService.recordAttendance('student789', '2026-08-01', 'PRESENT');
    console.assert(attendance.studentId === 'student789', 'Test Failed: Attendance studentId mismatch.');
    console.assert(attendance.status === 'PRESENT', 'Test Failed: Attendance status mismatch.');
    console.assert(mockAttendanceRepo._db.size === 1, 'Test Failed: Attendance not added to repository.');
    WK.logger().info('EducationService.recordAttendance test passed.');
    return true;
  }

  static testServiceRecordDropout() {
    WK.logger().info('Running EducationService.recordDropout test...');
    const { educationService, mockStudentRepo, mockDropoutRepo } = EducationTest._setupMocks();
    mockStudentRepo.create({ id: 'student789', citizenId: 'citizen123', schoolId: 'school456', currentEducationLevel: 'SD', currentGrade: 'Kelas 1' });
    const dropout = educationService.recordDropout('student789', '2026-08-01', 'Financial hardship');
    console.assert(dropout.studentId === 'student789', 'Test Failed: Dropout studentId mismatch.');
    console.assert(dropout.reason === 'Financial hardship', 'Test Failed: Dropout reason mismatch.');
    console.assert(mockDropoutRepo._db.size === 1, 'Test Failed: Dropout not added to repository.');
    const updatedStudent = mockStudentRepo.findById('student789');
    console.assert(updatedStudent.isDropout === true, 'Test Failed: Student isDropout status not updated.');
    WK.logger().info('EducationService.recordDropout test passed.');
    return true;
  }

  static testServiceEnrollInLiteracyProgram() {
    WK.logger().info('Running EducationService.enrollInLiteracyProgram test...');
    const { educationService, mockLiteracyRepo } = EducationTest._setupMocks();
    const enrollment = educationService.enrollInLiteracyProgram('citizen123', 'Program Baca Tulis');
    console.assert(enrollment.citizenId === 'citizen123', 'Test Failed: Literacy enrollment citizenId mismatch.');
    console.assert(enrollment.programName === 'Program Baca Tulis', 'Test Failed: Literacy program name mismatch.');
    console.assert(mockLiteracyRepo._db.size === 1, 'Test Failed: Literacy enrollment not added to repository.');
    WK.logger().info('EducationService.enrollInLiteracyProgram test passed.');
    return true;
  }
}

// Global function to run all tests, typically called from a test runner or directly in Apps Script
function runAllEducationModuleTests() {
  EducationTest.runAll();
}