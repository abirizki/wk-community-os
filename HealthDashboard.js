/**
 * @class HealthDashboard
 * @description Defines the widgets for the main Health dashboard.
 */
class HealthDashboard {
  /**
   * Returns an array of widget definitions for the Health dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'health.dashboard.view';
    return [
      {
        id: 'health_total_profiles',
        title: 'Total Health Profiles',
        type: 'summary_card',
        dataSource: 'HealthStatistics.getOverview',
        dataKey: 'totalProfiles',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'health_status_observation',
        title: 'Under Observation',
        type: 'summary_card',
        dataSource: 'HealthStatistics.getHealthStatusDistribution',
        dataKey: 'OBSERVATION',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'health_status_critical',
        title: 'Critical Status',
        type: 'summary_card',
        dataSource: 'HealthStatistics.getHealthStatusDistribution',
        dataKey: 'CRITICAL',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'health_status_distribution',
        title: 'Health Status Distribution',
        type: 'pie_chart',
        dataSource: 'HealthStatistics.getHealthStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'blood_type_distribution',
        title: 'Blood Type Distribution',
        type: 'donut_chart',
        dataSource: 'HealthStatistics.getBloodTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'monthly_registration_trend',
        title: 'New Health Profiles (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'HealthStatistics.getMonthlyRegistrationTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'top_diseases',
        title: 'Top 5 Reported Diseases',
        type: 'bar_chart',
        dataSource: 'HealthStatistics.getTopDiseases',
        size: '3x2',
        permission: permission,
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerHealthDashboard() {
  WK.dashboard('health_main', HealthDashboard.getWidgets());
}