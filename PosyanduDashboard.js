/**
 * @class PosyanduDashboard
 * @description Defines the widgets for the main Posyandu dashboard.
 */
class PosyanduDashboard {
  /**
   * Returns an array of widget definitions for the Posyandu dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'posyandu.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'posyandu_total_visits',
        title: 'Total Visits',
        type: 'summary_card',
        dataSource: 'PosyanduStatistics.getSummary',
        dataKey: 'totalVisits',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'posyandu_citizens_served',
        title: 'Citizens Served',
        type: 'summary_card',
        dataSource: 'PosyanduStatistics.getSummary',
        dataKey: 'uniqueCitizensServed',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'posyandu_visits_this_month',
        title: 'Visits This Month',
        type: 'summary_card',
        dataSource: 'PosyanduStatistics.getSummary',
        dataKey: 'visitsThisMonth',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'posyandu_follow_up_required',
        title: 'Follow-up Required',
        type: 'summary_card',
        dataSource: 'PosyanduStatistics.getSummary',
        dataKey: 'followUpRequired',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'posyandu_monthly_visit_trend',
        title: 'Monthly Visit Trend',
        type: 'area_chart',
        dataSource: 'PosyanduStatistics.getMonthlyVisitTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'posyandu_nutrition_distribution',
        title: 'Nutrition Status Distribution',
        type: 'pie_chart',
        dataSource: 'PosyanduStatistics.getNutritionDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'posyandu_development_distribution',
        title: 'Development Status Distribution',
        type: 'donut_chart',
        dataSource: 'PosyanduStatistics.getDevelopmentDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'posyandu_recent_visits',
        title: 'Recent Visits',
        type: 'table',
        dataSource: 'PosyanduService.listVisits',
        options: { limit: 5, sortBy: 'visitDate', order: 'desc' },
        columns: ['citizenId', 'visitDate', 'nutritionStatus', 'developmentStatus'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'posyandu_nutrition_risk_list',
        title: 'Nutrition Risk List',
        type: 'table',
        dataSource: 'PosyanduService.searchVisits',
        query: {
          nutritionStatus: { in: ['UNDERWEIGHT', 'SEVERELY_UNDERWEIGHT', 'OBESITY'] },
        },
        options: { limit: 10, sortBy: 'updatedAt', order: 'desc' },
        columns: ['citizenId', 'visitDate', 'nutritionStatus', 'weight', 'height'],
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
function registerPosyanduDashboard() {
  WK.dashboard('posyandu_main', PosyanduDashboard.getWidgets());
}