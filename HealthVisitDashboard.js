/**
 * @class HealthVisitDashboard
 * @description Defines the widgets for the main HealthVisit dashboard.
 */
class HealthVisitDashboard {
  /**
   * Returns an array of widget definitions for the HealthVisit dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'healthvisit.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'healthvisit_total',
        title: 'Total Visits',
        type: 'summary_card',
        dataSource: 'HealthVisitStatistics.getSummary',
        dataKey: 'totalVisits',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'healthvisit_completed',
        title: 'Completed',
        type: 'summary_card',
        dataSource: 'HealthVisitStatistics.getSummary',
        dataKey: 'completedVisits',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'healthvisit_scheduled',
        title: 'Scheduled',
        type: 'summary_card',
        dataSource: 'HealthVisitStatistics.getSummary',
        dataKey: 'scheduledVisits',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'healthvisit_missed',
        title: 'Missed / Cancelled',
        type: 'summary_card',
        dataSource: 'HealthVisitStatistics.getSummary',
        dataKey: 'missedOrCancelled',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'healthvisit_creation_trend',
        title: 'Visit Trend (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'HealthVisitStatistics.getTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'healthvisit_status_distribution',
        title: 'Status Distribution',
        type: 'pie_chart',
        dataSource: 'HealthVisitStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'healthvisit_type_distribution',
        title: 'Visit Type Distribution',
        type: 'donut_chart',
        dataSource: 'HealthVisitStatistics.getTypeDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'healthvisit_recent_activity',
        title: 'Recent Visits',
        type: 'table',
        dataSource: 'HealthVisitService.getRecentVisits',
        options: { limit: 10 },
        columns: ['citizenId', 'visitDate', 'visitType', 'visitStatus', 'providerId'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'healthvisit_quick_actions',
        title: 'Quick Actions',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_health_visit',
            label: 'Register New Visit',
            route: '/health-visits/new',
            permission: 'health.visit.create',
          },
          {
            id: 'search_health_visits',
            label: 'Search Visit History',
            route: '/health-visits/search',
            permission: 'health.visit.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerHealthVisitDashboard() {
  WK.dashboard('healthvisit_main', HealthVisitDashboard.getWidgets());
}