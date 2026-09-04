/**
 * @class EducationPermission
 * @description Defines all permissions related to the Education module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationPermission {
  /**
   * Returns an array of permission definitions for the Education module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'education.view', description: 'View all education data' },
      { id: 'education.student.create', description: 'Register new students' },
      { id: 'education.student.view', description: 'View student records' },
      { id: 'education.student.update', description: 'Update student records' },
      { id: 'education.student.delete', description: 'Delete student records' },
      { id: 'education.school.create', description: 'Register new schools' },
      { id: 'education.school.view', description: 'View school records' },
      { id: 'education.scholarship.apply', description: 'Apply for scholarships' },
      { id: 'education.scholarship.manage', description: 'Manage scholarship applications (approve/reject)' },
      { id: 'education.dropout.create', description: 'Record student dropouts' },
      { id: 'education.dropout.view', description: 'View dropout records' },
      { id: 'education.attendance.create', description: 'Record student attendance' },
      { id: 'education.attendance.view', description: 'View student attendance' },
      { id: 'education.literacy.enroll', description: 'Enroll citizens in literacy programs' },
      { id: 'education.literacy.view', description: 'View literacy program enrollments' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('education', EducationPermission.getPermissions());