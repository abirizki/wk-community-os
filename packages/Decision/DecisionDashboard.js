/**
 * @file DecisionDashboard.js
 * @description Defines UI widget configurations and analytics presentation mapping for the Decision module.
 */

class DecisionDashboard {
  /**
   * Returns an array of widget definitions registered for the Decision dashboard.
   * @returns {object[]}
   */
  static getWidgets() {
    const permission = 'decision.statistics.view';

    return [
      // =====================================================================
      // 1. SUMMARY CARDS
      // =====================================================================
      {
        id: 'decision_total_count',
        title: 'Total Ketetapan Musyawarah',
        type: 'summary_card',
        dataSource: 'DecisionStatistics.getSummary',
        dataKey: 'totalDecisions',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'decision_ratified_count',
        title: 'Ketetapan Aktif & Sah',
        type: 'summary_card',
        dataSource: 'DecisionStatistics.getSummary',
        dataKey: 'ratifiedDecisions',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'decision_draft_count',
        title: 'Draf Rancangan Ketetapan',
        type: 'summary_card',
        dataSource: 'DecisionStatistics.getSummary',
        dataKey: 'draftDecisions',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'decision_revoked_count',
        title: 'Ketetapan Dicabut / Batal',
        type: 'summary_card',
        dataSource: 'DecisionStatistics.getSummary',
        dataKey: 'revokedDecisions',
        size: '1x1',
        permission: permission,
      },

      // =====================================================================
      // 2. PERFORMANCE & VISUAL CHARTS
      // =====================================================================
      {
        id: 'decision_category_distribution',
        title: 'Distribusi Bidang & Kategori Ketetapan',
        type: 'pie_chart',
        dataSource: 'DecisionStatistics.getCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'decision_target_distribution',
        title: 'Distribusi Sasaran Penerima Dampak',
        type: 'donut_chart',
        dataSource: 'DecisionStatistics.getTargetTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'decision_trend',
        title: 'Tren Ratifikasi Ketetapan Musyawarah (12 Bulan)',
        type: 'line_chart',
        dataSource: 'DecisionStatistics.getDecisionTrend',
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 3. DATA TABLES
      // =====================================================================
      {
        id: 'decision_recent_table',
        title: 'Ketetapan Resmi Aktif Terbaru',
        type: 'table',
        dataSource: 'DecisionStatistics.getRecentDecisions',
        columns: [
          { key: 'decisionNumber', label: 'Nomor SK' },
          { key: 'title', label: 'Judul Ketetapan' },
          { key: 'category', label: 'Kategori' },
          { key: 'scopeId', label: 'Wilayah' },
          { key: 'effectiveDate', label: 'Berlaku Sejak' },
        ],
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 4. QUICK ACTIONS
      // =====================================================================
      {
        id: 'decision_quick_actions',
        title: 'Aksi Cepat Keputusan',
        type: 'quick_actions',
        size: '2x1',
        permission: permission,
        items: [
          { label: 'Draf Keputusan Baru', action: 'decision.create', icon: 'file-plus' },
          { label: 'Ratifikasi SK', action: 'decision.ratify', icon: 'file-check' },
        ],
      },
    ];
  }
}

module.exports = DecisionDashboard;

