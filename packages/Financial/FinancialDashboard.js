/**
 * @file FinancialDashboard.js
 * @description UI Widget configurations for the Financial (Keuangan) module.
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

class FinancialDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;

    // Protect dashboard access with RBAC
    if (security) {
      security.checkPermission('finance.statistics.view');
    }

    return [
      {
        id: 'treasury_summary_card',
        type: 'summary_card',
        title: 'Ringkasan Saldo & Arus Kas',
        dataSource: 'FinancialStatistics.getTreasurySummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 },
      },
      {
        id: 'dues_compliance_chart',
        type: 'donut_chart',
        title: 'Kepatuhan Iuran Bulan Ini',
        dataSource: 'FinancialStatistics.getDuesCompliance',
        mapping: { label: 'status', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 },
      },
      {
        id: 'cashflow_trend_chart',
        type: 'line_chart',
        title: 'Tren Arus Kas (6 Bulan Terakhir)',
        dataSource: 'FinancialStatistics.getIncomeExpenseTrend',
        mapping: { x: 'period', series: ['income', 'expense'] },
        layout: { w: 8, h: 4, x: 4, y: 2 },
      },
      {
        id: 'recent_transactions_table',
        type: 'table',
        title: 'Transaksi Kas Terbaru',
        dataSource: 'FinancialStatistics.getRecentTransactions',
        columns: [
          { key: 'transactionDate', label: 'Tanggal' },
          { key: 'category', label: 'Kategori' },
          { key: 'type', label: 'Tipe' },
          { key: 'amount', label: 'Nominal (Rp)', format: 'currency' },
          { key: 'description', label: 'Keterangan' },
        ],
        layout: { w: 8, h: 4, x: 0, y: 6 },
      },
      {
        id: 'financial_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Catat Pembayaran Iuran', command: 'finance.dues.record_payment', icon: 'payment' },
          { label: 'Catat Transaksi Kas', command: 'finance.transaction.create', icon: 'cash-register' },
        ],
        layout: { w: 4, h: 4, x: 8, y: 6 },
      },
    ];
  }
}

module.exports = { FinancialDashboard };

