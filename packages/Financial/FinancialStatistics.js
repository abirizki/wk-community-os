/**
 * @file FinancialStatistics.js
 * @description Analytics and aggregation layer for Financial module (Kas & Iuran).
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

const { FinancialConstants } = require('./FinancialEntity.js');

class FinancialStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('financial_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
    this.analytics = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('finance.statistics.view');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  _currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Total Saldo Kas, Total Pemasukan & Pengeluaran bulan ini.
   */
  getTreasurySummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getTreasurySummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const transactions = this.repository ? this.repository.findAllTransactions() : [];
    const currentMonth = this._currentMonth();

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeThisMonth = 0;
    let expenseThisMonth = 0;

    transactions.forEach(tx => {
      const txMonth = tx.transactionDate ? tx.transactionDate.slice(0, 7) : '';
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (txMonth === currentMonth) incomeThisMonth += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
        if (txMonth === currentMonth) expenseThisMonth += tx.amount;
      }
    });

    const result = {
      currentBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      incomeThisMonth,
      expenseThisMonth,
      period: currentMonth,
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 min TTL
    return result;
  }

  /**
   * Compliance ratio for dues billing in a given period.
   * Returns counts and percentage of PAID vs PENDING vs OVERDUE vs WAIVED.
   */
  getDuesCompliance(period) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getDuesCompliance', { period });
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const bills = this.repository ? this.repository.findBillsByPeriod(period) : [];
    const total = bills.length;

    const counts = {};
    FinancialConstants.DUES_STATUSES.forEach(s => { counts[s] = 0; });
    bills.forEach(b => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });

    const result = {
      period,
      total,
      counts,
      complianceRate: total > 0 ? ((counts['PAID'] / total) * 100).toFixed(1) : '0.0',
    };

    if (this.cache) this.cache.set(cacheKey, result, 300);
    return result;
  }

  /**
   * Monthly income vs expense trend (last N months) using AnalyticsService.
   */
  getIncomeExpenseTrend(filters = { months: 6 }) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getIncomeExpenseTrend', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result;

    // Delegate to AnalyticsService if available
    if (this.analytics && typeof this.analytics.getTimeSeries === 'function') {
      result = this.analytics.getTimeSeries('cash_transactions', {
        groupBy: 'type',
        dateField: 'transactionDate',
        valueField: 'amount',
        months: filters.months || 6,
      });
    } else {
      // Fallback: manual aggregation from repository
      const transactions = this.repository ? this.repository.findAllTransactions() : [];
      const monthMap = {};

      transactions.forEach(tx => {
        const month = tx.transactionDate ? tx.transactionDate.slice(0, 7) : 'UNKNOWN';
        if (!monthMap[month]) monthMap[month] = { period: month, income: 0, expense: 0 };
        if (tx.type === 'INCOME') monthMap[month].income += tx.amount;
        else if (tx.type === 'EXPENSE') monthMap[month].expense += tx.amount;
      });

      result = Object.values(monthMap).sort((a, b) => a.period.localeCompare(b.period));
    }

    if (this.cache) this.cache.set(cacheKey, result, 3600); // 1 hour TTL
    return result;
  }

  /**
   * Recent cash transactions for dashboard history table.
   */
  getRecentTransactions(limit = 5) {
    this._checkPermission();

    const transactions = this.repository ? this.repository.findAllTransactions() : [];

    // Sort by transactionDate descending
    transactions.sort((a, b) => {
      if (b.transactionDate > a.transactionDate) return 1;
      if (b.transactionDate < a.transactionDate) return -1;
      return 0;
    });

    return transactions.slice(0, limit).map(tx => ({
      id: tx.id,
      transactionDate: tx.transactionDate,
      category: tx.category,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
    }));
  }
}

module.exports = { FinancialStatistics };

