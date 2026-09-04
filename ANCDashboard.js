/**
 * @class ANCDashboard
 * @description Defines the widgets for the main Antenatal Care (ANC) dashboard.
 */
class ANCDashboard {
  /**
   * Returns an array of widget definitions for the ANC dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'anc.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'anc_total_visits',
        title: 'Total ANC Visits',
        type: 'summary_card',
        dataSource: 'ANCStatistics.getSummary',
        dataKey: 'totalAncVisits',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'anc_pregnancies_monitored',
        title: 'Pregnancies Monitored',
        type: 'summary_card',
        dataSource: 'ANCStatistics.getSummary',
        dataKey: 'pregnanciesMonitored',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'anc_high_risk',
        title: 'High Risk Visits',
        type: 'summary_card',
        dataSource: 'ANCStatistics.getSummary',
        dataKey: 'highRiskRecords',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'anc_follow_up_required',
        title: 'Follow-up Required',
        type: 'summary_card',
        dataSource: 'ANCStatistics.getSummary',
        dataKey: 'followUpRequired',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'anc_visit_trend',
        title: 'ANC Visit Trend (Last 12 Months)',
        type: 'area_chart',
        dataSource: 'ANCStatistics.getTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'anc_risk_distribution',
        title: 'Risk Distribution',
        type: 'pie_chart',
        dataSource: 'ANCStatistics.getRiskStatistics',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'anc_follow_up_distribution',
        title: 'Follow-up Status',
        type: 'donut_chart',
        dataSource: 'ANCStatistics.getFollowUpStatistics',
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'anc_recent_visits',
        title: 'Recent ANC Visits',
        type: 'table',
        dataSource: 'ANCService.getRecentVisits',
        options: { limit: 5 },
        columns: ['pregnancyId', 'visitDate', 'visitNumber', 'riskStatus', 'followUpRequired'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'anc_follow_up_queue',
        title: 'ANC Follow-up Queue',
        type: 'table',
        dataSource: 'ANCService.getFollowUpQueue',
        options: { limit: 10, sortBy: 'visitDate', order: 'desc' },
        columns: ['pregnancyId', 'visitDate', 'riskStatus', 'nextVisitDate'],
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
function registerANCDashboard() {
  WK.dashboard('anc_main', ANCDashboard.getWidgets());
}