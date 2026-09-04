/**
 * @class EducationService
 * @description The main service for the Education module, handling all business logic.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationService {
  /**
   * @param {StudentRepository} studentRepository
   * @param {SchoolRepository} schoolRepository
   * @param {ScholarshipRepository} scholarshipRepository
   * @param {DropoutRecordRepository} dropoutRecordRepository
   * @param {AttendanceRecordRepository} attendanceRecordRepository
   * @param {LiteracyProgramRepository} literacyProgramRepository
   * @param {EducationValidator} educationValidator
   * @param {CitizenService} citizenService
   */
  constructor(
    studentRepository,
    schoolRepository,
    scholarshipRepository,
    dropoutRecordRepository,
    attendanceRecordRepository,
    literacyProgramRepository,
    educationValidator,
    citizenService
  ) {
    /** @private */
    this.studentRepository = studentRepository;
    /** @private */
    this.schoolRepository = schoolRepository;
    /** @private */
    this.scholarshipRepository = scholarshipRepository;
    /** @private */
    this.dropoutRecordRepository = dropoutRecordRepository;
    /** @private */
    this.attendanceRecordRepository = attendanceRecordRepository;
    /** @private */
    this.literacyProgramRepository = literacyProgramRepository;
    /** @private */
    this.educationValidator = educationValidator;
    /** @private */
    this.citizenService = citizenService; // From Citizen package
    /** @private */
    this.eventBus = WK.service('eventbus');
    /** @private */
    this.workflowService = WK.service('workflow');
    /** @private */
    this.notificationService = WK.service('notification');
  }

  // --- Student Management ---

  /**
   * Registers a new student.
   * @param {object} data - Student data, including citizenId, schoolId, educationLevel, grade.
   * @returns {StudentEntity} The created student record.
   */
  registerStudent(data) {
    WK.security().checkPermission('education.student.create');
    this.educationValidator.validateStudentRegistration(data);

    const citizen = this.citizenService.getCitizenById(data.citizenId);
    if (!citizen) throw new Error('Citizen not found.');
    const school = this.schoolRepository.findById(data.schoolId);
    if (!school) throw new Error('School not found.');

    const newStudent = this.studentRepository.create(new StudentEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      ...data
    }));

    this.eventBus.publish({
      eventType: 'Education.Student.Registered',
      module: 'education',
      referenceId: newStudent.id,
      payload: { student: newStudent }
    });

    return newStudent;
  }

  /**
   * Updates an existing student's record.
   * @param {string} studentId - The ID of the student.
   * @param {object} updateData - Data to update.
   * @returns {StudentEntity} The updated student record.
   */
  updateStudent(studentId, updateData) {
    WK.security().checkPermission('education.student.update');
    const existingStudent = this.studentRepository.findById(studentId);
    if (!existingStudent) throw new Error('Student not found.');

    this.educationValidator.validateStudentUpdate(updateData);

    const updatedStudent = this.studentRepository.update(studentId, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    this.eventBus.publish({
      eventType: 'Education.Student.Updated',
      module: 'education',
      referenceId: updatedStudent.id,
      payload: { oldData: existingStudent, newData: updatedStudent }
    });

    return updatedStudent;
  }

  /**
   * Records a student's attendance.
   * @param {string} studentId - The ID of the student.
   * @param {string} recordDate - ISO 8601 date of attendance.
   * @param {string} status - Attendance status (e.g., 'PRESENT', 'ABSENT').
   * @param {string} [notes] - Optional notes.
   * @returns {AttendanceRecordEntity} The created attendance record.
   */
  recordAttendance(studentId, recordDate, status, notes) {
    WK.security().checkPermission('education.attendance.create');
    const student = this.studentRepository.findById(studentId);
    if (!student) throw new Error('Student not found.');

    this.educationValidator.validateAttendanceRecord({ studentId, recordDate, status });

    const newRecord = this.attendanceRecordRepository.create(new AttendanceRecordEntity({
      id: WK.helper().generateUuid(),
      studentId,
      recordDate,
      status,
      notes,
      createdAt: new Date().toISOString()
    }));

    this.eventBus.publish({
      eventType: 'Education.Attendance.Recorded',
      module: 'education',
      referenceId: newRecord.id,
      payload: { attendanceRecord: newRecord }
    });

    return newRecord;
  }

  // --- School Management ---

  /**
   * Registers a new school.
   * @param {object} data - School data.
   * @returns {SchoolEntity} The created school record.
   */
  registerSchool(data) {
    WK.security().checkPermission('education.school.create');
    this.educationValidator.validateSchoolRegistration(data);

    const newSchool = this.schoolRepository.create(new SchoolEntity({
      id: WK.helper().generateUuid(),
      createdAt: new Date().toISOString(),
      ...data
    }));

    this.eventBus.publish({
      eventType: 'Education.School.Registered',
      module: 'education',
      referenceId: newSchool.id,
      payload: { school: newSchool }
    });

    return newSchool;
  }

  // --- Scholarship Management ---

  /**
   * Applies a citizen for a scholarship.
   * @param {string} citizenId - The ID of the citizen applying.
   * @param {string} programName - The name of the scholarship program.
   * @param {object} [additionalData] - Additional application data.
   * @returns {ScholarshipEntity} The created scholarship application.
   */
  applyForScholarship(citizenId, programName, additionalData = {}) {
    WK.security().checkPermission('education.scholarship.apply');
    const citizen = this.citizenService.getCitizenById(citizenId);
    if (!citizen) throw new Error('Citizen not found.');

    this.educationValidator.validateScholarshipApplication({ citizenId, programName });

    const newApplication = this.scholarshipRepository.create(new ScholarshipEntity({
      id: WK.helper().generateUuid(),
      citizenId: citizenId,
      programName: programName,
      status: 'APPLIED',
      createdAt: new Date().toISOString(),
      ...additionalData
    }));

    // Start a workflow for scholarship approval
    this.workflowService.startWorkflow(
      'SCHOLARSHIP_APPROVAL',
      newApplication.id,
      citizenId,
      { programName: programName, applicantName: citizen.nama_lengkap }
    );

    this.eventBus.publish({
      eventType: 'Education.Scholarship.Applied',
      module: 'education',
      referenceId: newApplication.id,
      payload: { scholarship: newApplication }
    });

    return newApplication;
  }

  // --- Dropout Monitoring ---

  /**
   * Records a student as having dropped out.
   * @param {string} studentId - The ID of the student.
   * @param {string} dropoutDate - ISO 8601 date of dropout.
   * @param {string} reason - Reason for dropping out.
   * @returns {DropoutRecordEntity} The created dropout record.
   */
  recordDropout(studentId, dropoutDate, reason) {
    WK.security().checkPermission('education.dropout.create');
    const student = this.studentRepository.findById(studentId);
    if (!student) throw new Error('Student not found.');

    // Update student status
    this.studentRepository.update(studentId, { isDropout: true, updatedAt: new Date().toISOString() });

    const newDropoutRecord = this.dropoutRecordRepository.create(new DropoutRecordEntity({
      id: WK.helper().generateUuid(),
      studentId: studentId,
      dropoutDate: dropoutDate,
      reason: reason,
      createdAt: new Date().toISOString()
    }));

    this.eventBus.publish({
      eventType: 'Education.Student.DroppedOut',
      module: 'education',
      referenceId: newDropoutRecord.id,
      payload: { dropoutRecord: newDropoutRecord }
    });

    // Potentially start a workflow for intervention
    this.workflowService.startWorkflow(
      'DROPOUT_INTERVENTION',
      newDropoutRecord.id,
      student.citizenId,
      { studentId: studentId, reason: reason }
    );

    return newDropoutRecord;
  }

  // --- Literacy Programs ---

  /**
   * Enrolls a citizen in a literacy program.
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} programName - The name of the literacy program.
   * @returns {LiteracyProgramEntity} The enrollment record.
   */
  enrollInLiteracyProgram(citizenId, programName) {
    WK.security().checkPermission('education.literacy.enroll');
    const citizen = this.citizenService.getCitizenById(citizenId);
    if (!citizen) throw new Error('Citizen not found.');

    this.educationValidator.validateLiteracyEnrollment({ citizenId, programName });

    const enrollment = this.literacyProgramRepository.create(new LiteracyProgramEntity({
      id: WK.helper().generateUuid(),
      citizenId: citizenId,
      programName: programName,
      enrollmentDate: new Date().toISOString(),
      status: 'ENROLLED',
      createdAt: new Date().toISOString()
    }));

    this.eventBus.publish({
      eventType: 'Education.Literacy.Enrolled',
      module: 'education',
      referenceId: enrollment.id,
      payload: { enrollment: enrollment }
    });

    return enrollment;
  }

  // [TODO: Add other service methods for getById, findAll, update, delete for all entities]
}