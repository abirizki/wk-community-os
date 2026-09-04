/**
 * @class LetterDashboard
 * @description Defines the widgets for the main Letter dashboard.
 */
class LetterDashboard {
  /**
   * Returns an array of widget definitions for the Letter dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'letter.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'letter_total',
        title: 'Total Surat',
        type: 'summary_card',
        dataSource: 'LetterStatistics.getSummary',
        dataKey: 'totalLetters',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'letter_issued',
        title: 'Surat Diterbitkan',
        type: 'summary_card',
        dataSource: 'LetterStatistics.getSummary',
        dataKey: 'issuedLetters',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'letter_pending_signature',
        title: 'Menunggu TTD',
        type: 'summary_card',
        dataSource: 'LetterStatistics.getSummary',
        dataKey: 'pendingSignature',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'letter_revoked',
        title: 'Surat Dibatalkan',
        type: 'summary_card',
        dataSource: 'LetterStatistics.getSummary',
        dataKey: 'revokedLetters',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'letter_issuance_trend',
        title: 'Trend Penerbitan Surat (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'LetterStatistics.getIssuanceTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'letter_type_distribution',
        title: 'Distribusi Jenis Surat',
        type: 'pie_chart',
        dataSource: 'LetterStatistics.getLetterTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'letter_status_distribution',
        title: 'Distribusi Status Surat',
        type: 'bar_chart',
        dataSource: 'LetterStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'letter_pending_queue',
        title: 'Antrian Tanda Tangan',
        type: 'table',
        dataSource: 'LetterService.searchLetters',
        options: { query: { letterStatus: 'PENDING_SIGNATURE' }, limit: 10, sortBy: 'createdAt', order: 'asc' },
        columns: ['letterNumber', 'letterType', 'citizenId', 'createdAt'],
        permission: 'letter.document.read.all',
      },
      {
        id: 'letter_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'issue_letter',
            label: 'Tanda Tangan Surat',
            route: '/letters/issue-queue',
            permission: 'letter.document.issue',
          },
          {
            id: 'search_letters',
            label: 'Cari Surat',
            route: '/letters/search',
            permission: 'letter.document.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerLetterDashboard() {
  WK.dashboard('letter_main', LetterDashboard.getWidgets());
}