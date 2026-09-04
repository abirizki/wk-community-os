/**
 * @class PregnancyDashboard
 * @description Defines the widgets for the main pregnancy dashboard.
 */
class PregnancyDashboard {
  /**
   * Returns an array of widget definitions for the Pregnancy dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'pregnancy.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'pregnancy_active',
        title: 'Active Pregnancies',
        type: 'summary_card',
        dataSource: 'PregnancyStatistics.getSummary',
        dataKey: 'activePregnancies',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pregnancy_high_risk',
        title: 'High Risk',
        type: 'summary_card',
        dataSource: 'PregnancyStatistics.getSummary',
        dataKey: 'highRiskPregnancies',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pregnancy_monitoring',
        title: 'Under Monitoring',
        type: 'summary_card',
        dataSource: 'PregnancyStatistics.getSummary',
        dataKey: 'monitoringPregnancies',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pregnancy_follow_up',
        title: 'Follow-up Required',
        type: 'summary_card',
        dataSource: 'PregnancyStatistics.getSummary',
        dataKey: 'followUpRequired',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'pregnancy_registration_trend',
        title: 'New Pregnancy Registrations',
        type: 'area_chart',
        dataSource: 'PregnancyStatistics.getTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'pregnancy_risk_distribution',
        title: 'Risk Distribution',
        type: 'pie_chart',
        dataSource: 'PregnancyStatistics.getRiskStatistics',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'pregnancy_outcome_distribution',
        title: 'Outcome Distribution (Completed)',
        type: 'donut_chart',
        dataSource: 'PregnancyStatistics.getOutcomeStatistics',
        query: { status: 'COMPLETED' },
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'pregnancy_active_list',
        title: 'Active Pregnancies',
        type: 'table',
        dataSource: 'PregnancyService.searchPregnancies',
        query: { status: 'ACTIVE' },
        options: { limit: 10, sortBy: 'estimatedDueDate', order: 'asc' },
        columns: ['citizenId', 'riskStatus', 'estimatedDueDate', 'gestationalAgeWeeks'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'pregnancy_high_risk_list',
        title: 'High Risk Pregnancy List',
        type: 'table',
        dataSource: 'PregnancyService.searchPregnancies',
        query: {
          riskStatus: 'HIGH_RISK',
          status: 'ACTIVE',
        },
        options: { limit: 10, sortBy: 'updatedAt', order: 'desc' },
        columns: ['citizenId', 'riskStatus', 'estimatedDueDate', 'updatedAt'],
        size: '4x3',
        permission: permission,
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 * This makes the dashboard available to users with the appropriate permissions.
 */
function registerPregnancyDashboard() {
  WK.dashboard('pregnancy_main', PregnancyDashboard.getWidgets());
}