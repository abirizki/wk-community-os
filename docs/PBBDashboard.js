/**
 * @class PBBDashboard
 * @description Defines and registers dashboard widgets for the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBDashboard {
  /**
   * Returns an array of widget definitions for the PBB module.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      // --- Scorecards ---
      {
        id: 'pbb_total_sppt_issued',
        title: 'Total SPPT Issued (YTD)',
        type: 'scorecard',
        dataSource: 'PBBStatistics.getTotalSPPTIssuedYTD',
        size: 'small',
        permission: 'pbb.dashboard.view'
      },
      {
        id: 'pbb_total_revenue_collected',
        title: 'Total Revenue Collected (YTD)',
        type: 'scorecard',
        dataSource: 'PBBStatistics.getTotalRevenueCollectedYTD',
        size: 'small',
        permission: 'pbb.dashboard.view'
      },
      {
        id: 'pbb_total_arrears',
        title: 'Total Arrears',
        type: 'scorecard',
        dataSource: 'PBBStatistics.getTotalArrears',
        size: 'small',
        permission: 'pbb.dashboard.view'
      },
      // --- Charts ---
      {
        id: 'pbb_payment_status_chart',
        title: 'Payment Status Distribution',
        type: 'pie_chart',
        dataSource: 'PBBStatistics.getPaymentStatusDistribution',
        size: 'medium',
        permission: 'pbb.dashboard.view'
      },
      {
        id: 'pbb_arrears_by_taxpayer',
        title: 'Top Arrears by Taxpayer',
        type: 'table',
        dataSource: 'PBBStatistics.getTopArrearsByTaxpayer',
        size: 'large',
        permission: 'pbb.dashboard.view'
      }
    ];
  }
}

// Register the dashboard widgets with the framework's Dashboard Dispatcher
WK.dashboard('pbb', PBBDashboard.getWidgets());