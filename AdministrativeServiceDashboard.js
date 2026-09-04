/**
 * @class AdministrativeServiceDashboard
 * @description Defines the widgets for the main AdministrativeService dashboard.
 */
class AdministrativeServiceDashboard {
  /**
   * Returns an array of widget definitions for the AdministrativeService dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'administrativeservice.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'admin_service_total',
        title: 'Total Permohonan',
        type: 'summary_card',
        dataSource: 'AdministrativeServiceStatistics.getSummary',
        dataKey: 'totalRequests',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'admin_service_pending',
        title: 'Menunggu Verifikasi',
        type: 'summary_card',
        dataSource: 'AdministrativeServiceStatistics.getSummary',
        dataKey: 'pendingRequests',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'admin_service_completed',
        title: 'Selesai',
        type: 'summary_card',
        dataSource: 'AdministrativeServiceStatistics.getSummary',
        dataKey: 'completedRequests',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'admin_service_rejected',
        title: 'Ditolak',
        type: 'summary_card',
        dataSource: 'AdministrativeServiceStatistics.getSummary',
        dataKey: 'rejectedRequests',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'admin_service_submission_trend',
        title: 'Trend Permohonan Layanan (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'AdministrativeServiceStatistics.getSubmissionTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'admin_service_type_distribution',
        title: 'Distribusi Jenis Layanan',
        type: 'pie_chart',
        dataSource: 'AdministrativeServiceStatistics.getRequestTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'admin_service_status_distribution',
        title: 'Distribusi Status Permohonan',
        type: 'bar_chart',
        dataSource: 'AdministrativeServiceStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'admin_service_pending_queue',
        title: 'Antrian Verifikasi',
        type: 'table',
        dataSource: 'AdministrativeServiceService.searchRequests',
        options: { query: { requestStatus: { in: ['SUBMITTED', 'RT_VERIFIED'] } }, limit: 10, sortBy: 'submissionDate', order: 'asc' },
        columns: ['requestNumber', 'requestType', 'citizenId', 'requestStatus', 'submissionDate'],
        permission: 'administrativeservice.request.read.all',
      },
      {
        id: 'admin_service_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_admin_service',
            label: 'Buat Permohonan Baru',
            route: '/admin-services/new',
            permission: 'administrativeservice.request.create',
          },
          {
            id: 'search_admin_services',
            label: 'Cari Permohonan',
            route: '/admin-services/search',
            permission: 'administrativeservice.request.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerAdministrativeServiceDashboard() {
  WK.dashboard('administrative_service_main', AdministrativeServiceDashboard.getWidgets());
}