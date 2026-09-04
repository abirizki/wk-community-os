/**
 * @class ComplaintDashboard
 * @description Defines and registers all dashboard widgets for the Complaint package.
 * These widgets provide key statistics and overviews of complaint data,
 * intended for various roles from RT/RW to Kelurahan and administrative staff.
 *
 * @see WK_CODING_STANDARD.md - Dashboard Pattern
 */
class ComplaintDashboard {
  /**
   * Returns an array of widget definitions for the Complaint module.
   * Each widget definition specifies its appearance, data source, and required permissions.
   * The `dataSource` property points to a method within a service that the framework
   * will call to fetch the widget's data.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      // --- Key Performance Indicators (KPIs) ---
      {
        id: 'complaint_total_open',
        title: 'Total Keluhan Terbuka',
        type: 'scorecard',
        dataSource: 'ComplaintStatisticsService.getTotalOpenComplaints',
        size: 'small',
        permission: 'complaint.view.statistics'
      },
      {
        id: 'complaint_total_resolved_month',
        title: 'Keluhan Selesai (Bulan Ini)',
        type: 'scorecard',
        dataSource: 'ComplaintStatisticsService.getTotalResolvedThisMonth',
        size: 'small',
        permission: 'complaint.view.statistics'
      },
      {
        id: 'complaint_avg_resolution_time',
        title: 'Rata-rata Waktu Resolusi',
        type: 'scorecard',
        dataSource: 'ComplaintStatisticsService.getAverageResolutionTime',
        size: 'small',
        permission: 'complaint.view.statistics'
      },
      {
        id: 'complaint_critical_pending',
        title: 'Keluhan Kritis Pending',
        type: 'scorecard',
        dataSource: 'ComplaintStatisticsService.getCriticalPendingComplaints',
        size: 'small',
        permission: 'complaint.view.statistics'
      },

      // --- Charts and Trends ---
      {
        id: 'complaint_by_category_chart',
        title: 'Keluhan Berdasarkan Kategori',
        type: 'pie_chart',
        dataSource: 'ComplaintStatisticsService.getComplaintsByCategory',
        size: 'medium',
        permission: 'complaint.view.statistics'
      },
      {
        id: 'complaint_monthly_trend_chart',
        title: 'Tren Keluhan Bulanan',
        type: 'line_chart',
        dataSource: 'ComplaintStatisticsService.getMonthlyComplaintTrend',
        size: 'large',
        permission: 'complaint.view.statistics'
      },
      {
        id: 'complaint_by_rt_table',
        title: 'Keluhan per RT',
        type: 'table',
        dataSource: 'ComplaintStatisticsService.getComplaintsByRT',
        size: 'large',
        permission: 'complaint.view.statistics'
      }
    ];
  }
}

// Register the dashboard widgets with the framework's Dashboard Dispatcher
WK.dashboard('complaint', ComplaintDashboard.getWidgets());