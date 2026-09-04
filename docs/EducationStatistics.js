/**
 * @class EducationStatistics
 * @description Provides statistical data for the Education Dashboard.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationStatistics {
  /**
   * @param {AnalyticsService} analyticsService
   * @param {StudentRepository} studentRepository
   * @param {ScholarshipRepository} scholarshipRepository
   */
  constructor(analyticsService, studentRepository, scholarshipRepository) {
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.studentRepository = studentRepository;
    /** @private */
    this.scholarshipRepository = scholarshipRepository;
  }

  /**
   * Fetches the total count of registered students.
   * @returns {number}
   */
  getTotalStudents() {
    WK.security().checkPermission('education.view');
    const metricName = 'education.total.students';
    return this.analyticsService.getDashboardData(metricName) || this.studentRepository.findAll().length;
  }

  /**
   * Fetches the count of active scholarships.
   * @returns {number}
   */
  getActiveScholarshipsCount() {
    WK.security().checkPermission('education.view');
    const metricName = 'education.active.scholarships';
    return this.analyticsService.getDashboardData(metricName) || this.scholarshipRepository.findAll({ status: 'AWARDED' }).length;
  }

  /**
   * Fetches the current dropout rate.
   * @returns {number}
   */
  getDropoutRate() {
    WK.security().checkPermission('education.view');
    const metricName = 'education.dropout.rate';
    return this.analyticsService.getDashboardData(metricName) || 0; // Placeholder
  }

  getStudentsByEducationLevel() {
    WK.security().checkPermission('education.view');
    const metricName = 'education.students.by_level';
    return this.analyticsService.getDashboardData(metricName) || {}; // Placeholder
  }
}