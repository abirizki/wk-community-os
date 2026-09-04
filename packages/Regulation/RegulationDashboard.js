/**
 * @file RegulationDashboard.js
 * @description Defines UI widget configurations and analytics presentation mapping for the Regulation module.
 */

class RegulationDashboard {
  /**
   * Returns an array of widget definitions registered for the Regulation dashboard.
   * @returns {object[]}
   */
  static getWidgets() {
    const permission = 'regulation.statistics.view';

    return [
      // =====================================================================
      // 1. SUMMARY CARDS
      // =====================================================================
      {
        id: 'regulation_total_count',
        title: 'Total Lembaran Peraturan',
        type: 'summary_card',
        dataSource: 'RegulationStatistics.getSummary',
        dataKey: 'totalRegulations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'regulation_enacted_count',
        title: 'Peraturan Aktif & Berlaku',
        type: 'summary_card',
        dataSource: 'RegulationStatistics.getSummary',
        dataKey: 'enactedRegulations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'regulation_review_count',
        title: 'Dalam Tinjauan (Review)',
        type: 'summary_card',
        dataSource: 'RegulationStatistics.getSummary',
        dataKey: 'reviewRegulations',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'regulation_draft_count',
        title: 'Draf Rancangan Peraturan',
        type: 'summary_card',
        dataSource: 'RegulationStatistics.getSummary',
        dataKey: 'draftRegulations',
        size: '1x1',
        permission: permission,
      },

      // =====================================================================
      // 2. PERFORMANCE & VISUAL CHARTS
      // =====================================================================
      {
        id: 'regulation_category_distribution',
        title: 'Distribusi Bidang & Kategori Peraturan',
        type: 'pie_chart',
        dataSource: 'RegulationStatistics.getCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'regulation_status_distribution',
        title: 'Status Siklus Hukum Peraturan',
        type: 'donut_chart',
        dataSource: 'RegulationStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'regulation_trend',
        title: 'Tren Pengundangan Peraturan Warga (12 Bulan)',
        type: 'line_chart',
        dataSource: 'RegulationStatistics.getRegulationTrend',
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 3. DATA TABLES
      // =====================================================================
      {
        id: 'regulation_recent_table',
        title: 'Peraturan Resmi Aktif Terbaru',
        type: 'table',
        dataSource: 'RegulationStatistics.getRecentRegulations',
        columns: [
          { key: 'regulationNumber', label: 'Nomor Peraturan' },
          { key: 'title', label: 'Nama Peraturan' },
          { key: 'category', label: 'Kategori' },
          { key: 'scopeId', label: 'Wilayah' },
          { key: 'effectiveDate', label: 'Tanggal Berlaku' },
        ],
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 4. QUICK ACTIONS
      // =====================================================================
      {
        id: 'regulation_quick_actions',
        title: 'Aksi Cepat Peraturan',
        type: 'quick_actions',
        size: '2x1',
        permission: permission,
        items: [
          { label: 'Draf Peraturan Baru', action: 'regulation.create', icon: 'file-plus' },
          { label: 'Tinjau Peraturan', action: 'regulation.create', icon: 'file-eye' },
        ],
      },
    ];
  }
}

module.exports = RegulationDashboard;

