/**
 * @class PBBStatistics
 * @description Provides aggregated statistical data for the PBB (Pajak Bumi dan Bangunan) package.
 */
class PBBStatistics {
  /**
   * @param {PBBRepository} pbbRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(pbbRepository, analyticsService) {
    /** @private */
    this.repository = pbbRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('pbb_stats');
    /** @private */
    this.logger = WK.logger('PBBStatistics');
    /** @private */
    this.defaultCacheTTL = 3600; // 1 hour for PBB statistics
  }

  /**
   * Retrieves a high-level summary of PBB statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalSppt: this.repository.count({ ...filters }),
      unpaidSppt: this.repository.count({ ...filters, paymentStatus: 'BELUM LUNAS' }),
      overdueSppt: this.repository.count({ 
        ...filters, 
        dueDate: { lt: new Date().toISOString() }, 
        paymentStatus: 'BELUM LUNAS' 
      }),
      paidSppt: this.repository.count({ ...filters, paymentStatus: 'LUNAS' }),
      totalCollected: this.repository.sum(filters, 'taxAmount'),
      totalArrears: this.repository.sum(filters, 'arrearsAmount'),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Calculates the distribution of SPPT objects by payment status.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getPaymentStatusDistribution(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const statuses = PBBConstants.PAYMENT_STATUSES;
    const distribution = statuses.map(status => ({
      name: status.replace('_', ' '),
      value: this.repository.count({ ...filters, paymentStatus: status })
    }));
    
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of SPPT objects by category.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getObjectCategoryDistribution(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const categories = PBBConstants.OBJECT_CATEGORIES;
    const distribution = categories.map(category => ({
      name: category.replace('_', ' '),
      value: this.repository.count({ ...filters, objectCategory: category })
    }));
    
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of SPPT objects by tax year.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTaxYearDistribution(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const years = this.repository.dates(filters, 'taxYear', 'DESC');
    const distribution = years.map(year => ({
      name: year.value.toString(),
      value: year.count
    }));
    
    return distribution;
  }

  /**
   * Calculates the distribution of SPPT objects by RT (Rukun Tetangga).
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getRTDistribution(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const records = this.repository.search(filters);
    const distribution = [];
    
    records.forEach(record => {
      const key = `${record.rt}/${record.rw}`;
      const existing = distribution.find(d => d.name === key);
      if (existing) {
        existing.value++;
      } else {
        distribution.push({ name: key, value: 1 });
      }
    });
    
    return distribution.sort((a, b) => b.value - a.value);
  }

  /**
   * Retrieves the collection report for a specific period.
   * @param {object} [filters={}] - Optional filters.
   * @returns {object} Collection report data.
   */
  getCollectionReport(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const records = this.repository.search(filters);
    const report = {
      startDate: filters.startDate || new Date().toISOString().split('T')[0],
      endDate: filters.endDate || new Date().toISOString().split('T')[0],
      totalRecords: records.length,
      totalTaxAmount: records.reduce((sum, r) => sum + r.taxAmount, 0),
      totalCollected: 0,
      totalOverdue: 0,
      overdueRecords: [],
    };

    records.forEach(record => {
      if (record.paymentStatus === 'LUNAS') {
        report.totalCollected += record.taxAmount;
      } else if (record.paymentStatus === 'BELUM LUNAS' || record.paymentStatus === 'MENUNGGAK') {
        const isOverdue = new Date(record.dueDate) < new Date();
        if (isOverdue) {
          report.totalOverdue += record.taxAmount + record.arrearsAmount;
          report.overdueRecords.push({
            id: record.id,
            spptId: record.spptId,
            nop: record.nop,
            taxpayerName: record.taxpayerName,
            taxAmount: record.taxAmount,
            arrearsAmount: record.arrearsAmount,
            dueDate: record.dueDate,
            paymentStatus: record.paymentStatus,
          });
        }
      }
    });

    return report;
  }

  /**
   * Retrieves the monthly trend of new SPPT records.
   * @param {object} [filters={}] - Optional filters.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getCreatedTrend(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'sppt_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Retrieves the monthly trend of SPPT payments.
   * @param {object} [filters={}] - Optional filters.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getPaymentTrend(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'sppt_payment_confirmed',
      aggregation: 'sum',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Retrieves collection efficiency ratios.
   * @param {object} [filters={}] - Optional filters.
   * @returns {object} Efficiency metrics.
   */
  getEfficiencyMetrics(filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    const summary = this.getSummary(filters);
    
    const efficiency = {
      collectionRate: summary.totalSppt > 0 
        ? (summary.paidSppt / summary.totalSppt) * 100 
        : 0,
      overdueRate: summary.totalSppt > 0
        ? (summary.overdueSppt / summary.totalSppt) * 100
        : 0,
      arrearsRatio: summary.totalTaxAmount > 0
        ? summary.totalArrears / summary.totalTaxAmount
        : 0,
      averageCollectedPerRecord: summary.paidSppt > 0
        ? summary.totalCollected / summary.paidSppt
        : 0,
    };

    return efficiency;
  }

  /**
   * Retrieves the most delinquent taxpayers (top arrears).
   * @param {number} [limit=10] - Number of records to return.
   * @param {object} [filters={}] - Optional filters.
   * @returns {object[]} Array of top delinquent taxpayers.
   */
  getTopDelinquent(limit = 10, filters = {}) {
    WK.security().checkPermission('pbb.statistics.view');
    
    const records = this.repository.search({
      ...filters,
      paymentStatus: 'BELUM LUNAS',
      arrearsAmount: { gt: 0 },
    });
    
    // Sort by total arrears + tax amount
    const sorted = records
      .map(r => ({
        ...r,
        totalAmount: r.taxAmount + r.arrearsAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
    
    return sorted;
  }
}

module.exports = PBBStatistics;
