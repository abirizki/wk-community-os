/**
 * @file LetterDashboard.js
 * @description UI Widget configurations for the Letter (Surat Pengantar) module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

class LetterDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // RBAC check on dashboard entry
    if (security) {
      security.checkPermission('letter.statistics.view');
    }

    return [
      {
        id: 'letter_summary_card',
        type: 'summary_card',
        title: 'Ringkasan Layanan Surat',
        dataSource: 'LetterStatistics.getServiceSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'letter_type_distribution',
        type: 'pie_chart',
        title: 'Distribusi Jenis Surat',
        dataSource: 'LetterStatistics.getRequestsByType',
        mapping: { label: 'type', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'recent_letters_table',
        type: 'table',
        title: 'Pengajuan Surat Terbaru',
        dataSource: 'LetterStatistics.getRecentSubmissions',
        columns: [
          { key: 'createdAt', label: 'Tanggal' },
          { key: 'type', label: 'Jenis Surat' },
          { key: 'purpose', label: 'Keperluan' },
          { key: 'status', label: 'Status' },
        ],
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'letter_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Ajukan Surat Baru', command: 'letter.create', icon: 'file-plus' },
        ],
        layout: { w: 12, h: 2, x: 0, y: 6 },
      },
    ];
  }
}

module.exports = { LetterDashboard };

