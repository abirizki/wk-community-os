/**
 * @file AspirationDashboard.js
 * @description UI Widget configurations for the Aspiration (Usulan & Musrenbang Warga) module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

class AspirationDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // RBAC check on dashboard entry
    if (security) {
      security.checkPermission('aspiration.statistics.view');
    }

    return [
      {
        id: 'aspiration_summary_card',
        type: 'summary_card',
        title: 'Ringkasan Partisipasi Musrenbang',
        dataSource: 'AspirationStatistics.getParticipationSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'aspiration_category_chart',
        type: 'donut_chart',
        title: 'Distribusi Kategori Usulan',
        dataSource: 'AspirationStatistics.getCategoryDistribution',
        mapping: { label: 'category', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'top_aspirations_table',
        type: 'table',
        title: 'Usulan Prioritas Terpopuler (Top Upvotes)',
        dataSource: 'AspirationStatistics.getTopAspirations',
        columns: [
          { key: 'title', label: 'Judul Usulan' },
          { key: 'category', label: 'Kategori' },
          { key: 'priority', label: 'Prioritas' },
          { key: 'voteCount', label: 'Total Vote' },
          { key: 'status', label: 'Status' },
        ],
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'aspiration_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Ajukan Usulan', command: 'aspiration.create', icon: 'lightbulb' },
        ],
        layout: { w: 12, h: 2, x: 0, y: 6 },
      },
    ];
  }
}

module.exports = { AspirationDashboard };

