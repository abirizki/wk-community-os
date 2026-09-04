/**
 * @class ImmunizationDashboard
 * @description Defines the widgets for the main Immunization dashboard.
 */
class ImmunizationDashboard {
  /**
   * Returns an array of widget definitions for the Immunization dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'immunization.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'immunization_total_records',
        title: 'Total Records',
        type: 'summary_card',
        dataSource: 'ImmunizationStatistics.getSummary',
        dataKey: 'totalRecords',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'immunization_administered',
        title: 'Administered',
        type: 'summary_card',
        dataSource: 'ImmunizationStatistics.getSummary',
        dataKey: 'administered',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'immunization_upcoming',
        title: 'Upcoming Doses',
        type: 'summary_card',
        dataSource: 'ImmunizationStatistics.getSummary',
        dataKey: 'upcoming',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'immunization_missed',
        title: 'Missed Doses',
        type: 'summary_card',
        dataSource: 'ImmunizationStatistics.getSummary',
        dataKey: 'missed',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'immunization_administration_trend',
        title: 'Immunizations Administered (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'ImmunizationStatistics.getTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'immunization_status_distribution',
        title: 'Status Distribution',
        type: 'pie_chart',
        dataSource: 'ImmunizationStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'immunization_vaccine_distribution',
        title: 'Top Administered Vaccines',
        type: 'bar_chart',
        dataSource: 'ImmunizationStatistics.getVaccineDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'immunization_recent_activity',
        title: 'Recent Administrations',
        type: 'table',
        dataSource: 'ImmunizationStatistics.getRecentActivity',
        options: { limit: 5 },
        columns: ['citizenId', 'vaccineName', 'doseNumber', 'administrationDate', 'providerId'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'immunization_missed_queue',
        title: 'Missed Dose Follow-up Queue',
        type: 'table',
        dataSource: 'ImmunizationService.getMissedQueue',
        options: { limit: 10, sortBy: 'administrationDate', order: 'desc' },
        columns: ['citizenId', 'vaccineName', 'doseNumber', 'administrationDate'],
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
function registerImmunizationDashboard() {
  WK.dashboard('immunization_main', ImmunizationDashboard.getWidgets());
}