/**
 * @file PBBDashboard.js
 * @description UI Widget configurations for PBB tax management module.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

class PBBDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // RBAC check on dashboard entry
    if (security) {
      security.checkPermission('pbb.view.all');
    }

    return [
      {
        id: 'pbb_realization_card',
        type: 'summary_card',
        title: 'Realisasi Target PBB',
        dataSource: 'PBBStatistics.getTaxRealizationSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'pbb_compliance_chart',
        type: 'donut_chart',
        title: 'Distribusi Kepatuhan SPPT PBB',
        dataSource: 'PBBStatistics.getComplianceDistribution',
        mapping: { label: 'status', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'pbb_recent_payments_table',
        type: 'table',
        title: 'Daftar Konfirmasi Pembayaran Terbaru',
        dataSource: 'PBBStatistics.getRecentPayments',
        columns: [
          { key: 'nop', label: 'NOP' },
          { key: 'paidAmount', label: 'Nominal' },
          { key: 'verifiedBy', label: 'Diverifikasi Oleh' },
          { key: 'createdAt', label: 'Tanggal' },
        ],
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'pbb_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Lapor Bayar PBB', command: 'pbb.confirm_payment', icon: 'credit-card' },
        ],
        layout: { w: 12, h: 2, x: 0, y: 6 },
      },
    ];
  }
}

module.exports = { PBBDashboard };
