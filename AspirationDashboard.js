/**
 * @class AspirationDashboard
 * @description Defines the widgets for the main Aspiration dashboard.
 */
class AspirationDashboard {
  /**
   * Returns an array of widget definitions for the Aspiration dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'aspiration.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'aspiration_total',
        title: 'Total Aspirasi',
        type: 'summary_card',
        dataSource: 'AspirationStatistics.getSummary',
        dataKey: 'totalAspirations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'aspiration_submitted',
        title: 'Diajukan',
        type: 'summary_card',
        dataSource: 'AspirationStatistics.getSummary',
        dataKey: 'submittedAspirations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'aspiration_in_review',
        title: 'Dalam Tinjauan',
        type: 'summary_card',
        dataSource: 'AspirationStatistics.getSummary',
        dataKey: 'inReviewAspirations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'aspiration_implemented',
        title: 'Diimplementasikan',
        type: 'summary_card',
        dataSource: 'AspirationStatistics.getSummary',
        dataKey: 'implementedAspirations',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'aspiration_submission_trend',
        title: 'Trend Aspirasi Masuk (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'AspirationStatistics.getSubmissionTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'aspiration_category_distribution',
        title: 'Distribusi Kategori Aspirasi',
        type: 'pie_chart',
        dataSource: 'AspirationStatistics.getCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'aspiration_status_distribution',
        title: 'Distribusi Status Aspirasi',
        type: 'bar_chart',
        dataSource: 'AspirationStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'aspiration_pending_queue',
        title: 'Aspirasi Menunggu Tinjauan',
        type: 'table',
        dataSource: 'AspirationService.searchAspirations',
        options: { query: { status: 'SUBMITTED' }, limit: 10, sortBy: 'submissionDate', order: 'asc' },
        columns: ['id', 'subject', 'category', 'status', 'submissionDate'],
        permission: 'aspiration.record.read.all',
      },
      {
        id: 'aspiration_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_aspiration',
            label: 'Ajukan Aspirasi Baru',
            route: '/aspirations/new',
            permission: 'aspiration.record.create',
          },
          {
            id: 'search_aspirations',
            label: 'Cari Aspirasi',
            route: '/aspirations/search',
            permission: 'aspiration.record.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerAspirationDashboard() {
  WK.dashboard('aspiration_main', AspirationDashboard.getWidgets());
}

