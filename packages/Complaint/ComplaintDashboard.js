/**
 * @file ComplaintDashboard.js
 * @description UI Widget configurations for the Complaint (Pengaduan Warga) module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

class ComplaintDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // RBAC check on dashboard entry
    if (security) {
      security.checkPermission('complaint.statistics.view');
    }

    return [
      {
        id: 'complaint_summary_card',
        type: 'summary_card',
        title: 'Ringkasan Aduan Warga',
        dataSource: 'ComplaintStatistics.getComplaintSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'complaint_category_chart',
        type: 'donut_chart',
        title: 'Distribusi Kategori Aduan',
        dataSource: 'ComplaintStatistics.getCategoryDistribution',
        mapping: { label: 'category', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'recent_complaints_table',
        type: 'table',
        title: 'Daftar Aduan Terbaru',
        dataSource: 'ComplaintStatistics.getRecentComplaints',
        columns: [
          { key: 'createdAt', label: 'Tanggal' },
          { key: 'category', label: 'Kategori' },
          { key: 'priority', label: 'Prioritas' },
          { key: 'status', label: 'Status' },
        ],
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'complaint_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Lapor Masalah', command: 'complaint.create', icon: 'alert-triangle' },
        ],
        layout: { w: 12, h: 2, x: 0, y: 6 },
      },
    ];
  }
}

module.exports = { ComplaintDashboard };

