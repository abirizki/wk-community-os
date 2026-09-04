/**
 * @class EducationDashboard
 * @description Defines and registers dashboard widgets for the Education module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class EducationDashboard {
  /**
   * Returns an array of widget definitions for the Education module.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      // --- Scorecards ---
      {
        id: 'education_total_students',
        title: 'Total Students',
        type: 'scorecard',
        dataSource: 'EducationStatistics.getTotalStudents',
        size: 'small',
        permission: 'education.dashboard.view'
      },
      {
        id: 'education_active_scholarships',
        title: 'Active Scholarships',
        type: 'scorecard',
        dataSource: 'EducationStatistics.getActiveScholarshipsCount',
        size: 'small',
        permission: 'education.dashboard.view'
      },
      {
        id: 'education_dropout_rate',
        title: 'Dropout Rate',
        type: 'scorecard',
        dataSource: 'EducationStatistics.getDropoutRate',
        size: 'small',
        permission: 'education.dashboard.view'
      },
      // --- Charts ---
      {
        id: 'education_by_level_chart',
        title: 'Students by Education Level',
        type: 'bar_chart',
        dataSource: 'EducationStatistics.getStudentsByEducationLevel',
        size: 'medium',
        permission: 'education.dashboard.view'
      }
    ];
  }
}

// Register the dashboard widgets with the framework's Dashboard Dispatcher
WK.dashboard('education', EducationDashboard.getWidgets());