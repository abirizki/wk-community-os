/**
 * @class MotherDashboard
 * @description Defines the widgets for the main maternal health dashboard.
 */
class MotherDashboard {
  /**
   * Returns an array of widget definitions for the Mother dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'mother.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'mother_total_profiles',
        title: 'Total Mother Profiles',
        type: 'summary_card',
        dataSource: 'MotherStatistics.getSummary',
        dataKey: 'totalMothers',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'mother_pregnant',
        title: 'Pregnant Mothers',
        type: 'summary_card',
        dataSource: 'MotherStatistics.getSummary',
        dataKey: 'pregnantMothers',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'mother_high_risk',
        title: 'High Risk Mothers',
        type: 'summary_card',
        dataSource: 'MotherStatistics.getSummary',
        dataKey: 'highRiskMothers',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'mother_monitoring',
        title: 'Under Monitoring',
        type: 'summary_card',
        dataSource: 'MotherStatistics.getSummary',
        dataKey: 'monitoringMothers',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'mother_registration_trend',
        title: 'New Mother Registrations (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'MotherStatistics.getMotherRegistrationTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'mother_pregnancy_status_distribution',
        title: 'Pregnancy Status',
        type: 'pie_chart',
        dataSource: 'MotherStatistics.getPregnancyStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'mother_risk_status_distribution',
        title: 'Maternal Risk Status',
        type: 'donut_chart',
        dataSource: 'MotherStatistics.getMaternalRiskDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'mother_recent_profiles',
        title: 'Recently Registered Mothers',
        type: 'table',
        dataSource: 'MotherService.listMothers',
        options: { limit: 5, sortBy: 'createdAt', order: 'desc' },
        columns: ['citizenId', 'pregnancyStatus', 'maternalRiskStatus', 'createdAt'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'mother_high_risk_list',
        title: 'High Risk Mothers List',
        type: 'table',
        dataSource: 'MotherService.searchMothers',
        query: {
          maternalRiskStatus: 'HIGH_RISK',
        },
        options: { limit: 10, sortBy: 'updatedAt', order: 'desc' },
        columns: ['citizenId', 'pregnancyStatus', 'maternalRiskStatus', 'updatedAt'],
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
function registerMotherDashboard() {
  WK.dashboard('mother_main', MotherDashboard.getWidgets());
}