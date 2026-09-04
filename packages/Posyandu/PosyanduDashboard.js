/**
 * @file PosyanduDashboard.js
 * @description UI Widget configurations for the Posyandu (Community Health) module.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

class PosyanduDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // RBAC check on dashboard entry
    if (security) {
      security.checkPermission('posyandu.statistics.view');
    }

    return [
      {
        id: 'health_summary_card',
        type: 'summary_card',
        title: 'Ringkasan Kesehatan Komunitas',
        dataSource: 'PosyanduStatistics.getHealthSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'nutrition_donut_chart',
        type: 'donut_chart',
        title: 'Distribusi Status Gizi Balita',
        dataSource: 'PosyanduStatistics.getNutritionDistribution',
        mapping: { label: 'status', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'followup_records_table',
        type: 'table',
        title: 'Daftar Rujukan & Pemantauan Risiko',
        dataSource: 'PosyanduStatistics.getRecentFollowUps',
        columns: [
          { key: 'visitDate', label: 'Tanggal' },
          { key: 'targetGroup', label: 'Grup Sasaran' },
          { key: 'status', label: 'Status' },
          { key: 'riskNotes', label: 'Catatan Risiko' },
        ],
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'posyandu_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Catat Kunjungan', command: 'posyandu.record.create', icon: 'activity' },
        ],
        layout: { w: 12, h: 2, x: 0, y: 6 },
      },
    ];
  }
}

module.exports = { PosyanduDashboard };

