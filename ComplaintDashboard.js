/**
 * @class ComplaintDashboard
 * @description Defines the widgets for the main Complaint dashboard.
 */
class ComplaintDashboard {
  /**
   * Returns an array of widget definitions for the Complaint dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'complaint.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'complaint_total',
        title: 'Total Pengaduan',
        type: 'summary_card',
        dataSource: 'ComplaintStatistics.getSummary',
        dataKey: 'totalComplaints',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'complaint_open',
        title: 'Pengaduan Terbuka',
        type: 'summary_card',
        dataSource: 'ComplaintStatistics.getSummary',
        dataKey: 'openComplaints',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'complaint_resolved',
        title: 'Terselesaikan',
        type: 'summary_card',
        dataSource: 'ComplaintStatistics.getSummary',
        dataKey: 'resolvedComplaints',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'complaint_closed',
        title: 'Ditutup',
        type: 'summary_card',
        dataSource: 'ComplaintStatistics.getSummary',
        dataKey: 'closedComplaints',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'complaint_created_trend',
        title: 'Trend Pengaduan Masuk (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'ComplaintStatistics.getCreatedTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'complaint_category_distribution',
        title: 'Distribusi Kategori Pengaduan',
        type: 'pie_chart',
        dataSource: 'ComplaintStatistics.getCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'complaint_status_distribution',
        title: 'Distribusi Status Pengaduan',
        type: 'bar_chart',
        dataSource: 'ComplaintStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'complaint_pending_queue',
        title: 'Pengaduan Menunggu Penugasan',
        type: 'table',
        dataSource: 'ComplaintService.searchComplaints',
        options: { query: { status: 'IN_REVIEW' }, limit: 10, sortBy: 'submissionDate', order: 'asc' },
        columns: ['id', 'subject', 'category', 'priority', 'submissionDate'],
        permission: 'complaint.record.read.all',
      },
      {
        id: 'complaint_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_complaint',
            label: 'Buat Pengaduan Baru',
            route: '/complaints/new',
            permission: 'complaint.record.create',
          },
          {
            id: 'search_complaints',
            label: 'Cari Pengaduan',
            route: '/complaints/search',
            permission: 'complaint.record.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerComplaintDashboard() {
  WK.dashboard('complaint_main', ComplaintDashboard.getWidgets());
}