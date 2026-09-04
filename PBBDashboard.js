/**
 * @class PBBDashboard
 * @description Defines the widgets for the main PBB dashboard.
 */
class PBBDashboard {
  /**
   * Returns an array of widget definitions for the PBB dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'pbb.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'pbb_total',
        title: 'Total PBB/SPPT',
        type: 'summary_card',
        dataSource: 'PBBStatistics.getSummary',
        dataKey: 'totalSppt',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pbb_unpaid',
        title: 'Belum Lunas',
        type: 'summary_card',
        dataSource: 'PBBStatistics.getSummary',
        dataKey: 'unpaidSppt',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pbb_overdue',
        title: 'Terlambat Bayar (Overdue)',
        type: 'summary_card',
        dataSource: 'PBBStatistics.getSummary',
        dataKey: 'overdueSppt',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pbb_total_collected',
        title: 'Total Dibayar',
        type: 'summary_card',
        dataSource: 'PBBStatistics.getSummary',
        dataKey: 'totalCollected',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'pbb_overdue_amount',
        title: 'Total Tanpa Bayar',
        type: 'summary_card',
        dataSource: 'PBBStatistics.getSummary',
        dataKey: 'totalArrears',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'pbb_payment_status',
        title: 'Status Pembayaran',
        type: 'pie_chart',
        dataSource: 'PBBStatistics.getPaymentStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'pbb_object_category',
        title: 'Kategori Objek Pajak',
        type: 'pie_chart',
        dataSource: 'PBBStatistics.getObjectCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'pbb_tax_year_distribution',
        title: 'Distribusi Tahun Pajak',
        type: 'bar_chart',
        dataSource: 'PBBStatistics.getTaxYearDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'pbb_account_collection_trend',
        title: 'Trend Penagihan Bulanan',
        type: 'line_chart',
        dataSource: 'PBBStatistics.getPaymentTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'pbb_generation_trend',
        title: 'Trend Pembuatan SPPT Bulanan',
        type: 'line_chart',
        dataSource: 'PBBStatistics.getCreatedTrend',
        size: '4x2',
        permission: permission,
      },

      // Tables
      {
        id: 'pbb_top_delinquent',
        title: 'Penghapus Tertunggak',
        type: 'table',
        dataSource: 'PBBStatistics.getTopDelinquent',
        options: { limit: 10, sortBy: 'totalAmount', order: 'desc' },
        size: '2x2',
        columns: ['spptId', 'taxpayerName', 'taxAmount', 'arrearsAmount', 'dueDate'],
        permission: permission,
      },
      {
        id: 'pbb_unpaid_list',
        title: 'Daftar Belum Lunas',
        type: 'table',
        dataSource: 'PBBService.searchPBB',
        options: { query: { paymentStatus: 'BELUM LUNAS' }, limit: 15, sortBy: 'dueDate', order: 'asc' },
        columns: ['spptId', 'nop', 'taxpayerName', 'taxAmount', 'dueDate'],
        permission: 'pbb.sppt.read.all',
      },

      // Performance Metrics
      {
        id: 'pbb_efficiency_metrics',
        title: 'Indikator Kinerja Pengumpulan',
        type: 'card_group',
        size: '2x2',
        permission: permission,
        metrics: [
          {
            title: 'Tingkat Koleksi',
            valueKey: 'collectionRate',
            unit: '%',
            dataSource: 'PBBStatistics.getEfficiencyMetrics',
          },
          {
            title: 'Tingkat Terlambat',
            valueKey: 'overdueRate',
            unit: '%',
            dataSource: 'PBBStatistics.getEfficiencyMetrics',
          },
          {
            title: 'Rasio Tunggakan',
            valueKey: 'arrearsRatio',
            unit: '%',
            dataSource: 'PBBStatistics.getEfficiencyMetrics',
          },
          {
            title: 'Rata-rata Terbayar/Record',
            valueKey: 'averageCollectedPerRecord',
            unit: 'Rp',
            dataSource: 'PBBStatistics.getEfficiencyMetrics',
          },
        ],
      },

      // Quick Actions
      {
        id: 'pbb_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_sppt',
            label: 'Buat SPPT Baru',
            route: '/pbb/sppt/create',
            permission: 'pbb.sppt.create',
          },
          {
            id: 'mark_overdue',
            label: 'Tandai Terlambat',
            route: '/pbb/sppt/mark-overdue',
            permission: 'pbb.overdue.mark',
          },
          {
            id: 'payments',
            label: 'Konfirmasi Pembayaran',
            route: '/pbb/payments',
            permission: 'pbb.payment.confirm',
          },
          {
            id: 'reports',
            label: 'Laporan',
            route: '/pbb/reports',
            permission: 'pbb.statistics.view',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerPBBDashboard() {
  WK.dashboard('pbb_main', PBBDashboard.getWidgets());
}

module.exports = { PBBDashboard, registerPBBDashboard };
