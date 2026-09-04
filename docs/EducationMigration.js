/**
 * @class EducationMigration
 * @description Handles database schema migrations for the Education module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Education module migration: up()');
    const dbAdapter = WK.database();

    // 1. Create 'education_students' table
    const studentsTable = 'education_students';
    if (!dbAdapter.hasTable(studentsTable)) {
      dbAdapter.createTable(studentsTable);
      dbAdapter.addColumns(studentsTable, ['id', 'citizenId', 'schoolId', 'currentEducationLevel', 'currentGrade', 'enrollmentDate', 'isDropout', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(studentsTable, 'citizenId', { unique: true });
      dbAdapter.ensureIndex(studentsTable, 'schoolId');
      WK.logger().info(`Created table: ${studentsTable}`);
    }

    // 2. Create 'education_schools' table
    const schoolsTable = 'education_schools';
    if (!dbAdapter.hasTable(schoolsTable)) {
      dbAdapter.createTable(schoolsTable);
      dbAdapter.addColumns(schoolsTable, ['id', 'name', 'type', 'address', 'contactPerson', 'contactPhone', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(schoolsTable, 'name', { unique: true });
      WK.logger().info(`Created table: ${schoolsTable}`);
    }

    // 3. Create 'education_scholarships' table
    const scholarshipsTable = 'education_scholarships';
    if (!dbAdapter.hasTable(scholarshipsTable)) {
      dbAdapter.createTable(scholarshipsTable);
      dbAdapter.addColumns(scholarshipsTable, ['id', 'programName', 'citizenId', 'status', 'amount', 'startDate', 'endDate', 'notes', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(scholarshipsTable, 'citizenId');
      WK.logger().info(`Created table: ${scholarshipsTable}`);
    }

    // 4. Create 'education_dropout_records' table
    const dropoutTable = 'education_dropout_records';
    if (!dbAdapter.hasTable(dropoutTable)) {
      dbAdapter.createTable(dropoutTable);
      dbAdapter.addColumns(dropoutTable, ['id', 'studentId', 'dropoutDate', 'reason', 'interventionStatus', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(dropoutTable, 'studentId');
      WK.logger().info(`Created table: ${dropoutTable}`);
    }

    // 5. Create 'education_attendance_records' table
    const attendanceTable = 'education_attendance_records';
    if (!dbAdapter.hasTable(attendanceTable)) {
      dbAdapter.createTable(attendanceTable);
      dbAdapter.addColumns(attendanceTable, ['id', 'studentId', 'recordDate', 'status', 'notes', 'createdAt']);
      dbAdapter.ensureIndex(attendanceTable, 'studentId');
      WK.logger().info(`Created table: ${attendanceTable}`);
    }

    // 6. Create 'education_literacy_programs' table
    const literacyTable = 'education_literacy_programs';
    if (!dbAdapter.hasTable(literacyTable)) {
      dbAdapter.createTable(literacyTable);
      dbAdapter.addColumns(literacyTable, ['id', 'citizenId', 'programName', 'enrollmentDate', 'status', 'completionDate', 'createdAt']);
      dbAdapter.ensureIndex(literacyTable, 'citizenId');
      WK.logger().info(`Created table: ${literacyTable}`);
    }

    WK.logger().info('Education module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Education module migration: down() - This is a destructive operation!');
    const dbAdapter = WK.database();
    // dbAdapter.dropTable('education_students');
    // dbAdapter.dropTable('education_schools');
    // dbAdapter.dropTable('education_scholarships');
    // dbAdapter.dropTable('education_dropout_records');
    // dbAdapter.dropTable('education_attendance_records');
    // dbAdapter.dropTable('education_literacy_programs');
    WK.logger().info("'down' migration for Education executed (conceptual).");
  }
}