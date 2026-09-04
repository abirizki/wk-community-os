/**
 * @class EducationSeeder
 * @description Seeds initial or demo data for the Education module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationSeeder {
  /**
   * @param {EducationService} educationService
   * @param {CitizenService} citizenService
   */
  constructor(educationService, citizenService) {
    /** @private */
    this.educationService = educationService;
    /** @private */
    this.citizenService = citizenService;
  }

  /**
   * Runs the seeder to populate the database.
   */
  run() {
    WK.security().checkPermission('education.seed');
    WK.logger().info('Running Education module seeder...');

    this._seedDemoSchools();
    this._seedDemoStudents();
    this._seedDemoScholarships();
    this._seedDemoLiteracyPrograms();

    WK.logger().info('Education module seeder completed.');
  }

  /** @private */
  _seedDemoSchools() {
    if (this.educationService.schoolRepository.findAll().length === 0) {
      this.educationService.registerSchool({
        name: 'SDN Kebonjati 1',
        type: 'SD',
        address: { street: 'Jl. Raya Kebonjati No. 10', village: 'Kebonjati' },
        contactPerson: 'Bapak Kepala Sekolah',
        contactPhone: '081234567890'
      });
      WK.logger().info('Seeded SDN Kebonjati 1.');
    }
  }

  /** @private */
  _seedDemoStudents() {
    const demoCitizen = this.citizenService.findAll({ limit: 1 })[0];
    const demoSchool = this.educationService.schoolRepository.findAll({ limit: 1 })[0];

    if (demoCitizen && demoSchool && this.educationService.studentRepository.findAll().length === 0) {
      this.educationService.registerStudent({
        citizenId: demoCitizen.id,
        schoolId: demoSchool.id,
        currentEducationLevel: 'SD',
        currentGrade: 'Kelas 3',
        enrollmentDate: new Date().toISOString()
      });
      WK.logger().info(`Seeded one demo student for citizen ${demoCitizen.nama_lengkap}.`);
    }
  }

  /** @private */
  _seedDemoScholarships() {
    // [TODO: Add logic to seed demo scholarships]
  }

  /** @private */
  _seedDemoLiteracyPrograms() {
    // [TODO: Add logic to seed demo literacy programs]
  }
}