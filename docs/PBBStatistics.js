/**
 * @class PBBStatistics
 * @description Provides statistical data for the PBB Dashboard.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBStatistics {
  /**
   * @param {AnalyticsService} analyticsService
   * @param {SPPTRepository} spptRepository
   * @param {PaymentHistoryRepository} paymentHistoryRepository
   */
  constructor(analyticsService, spptRepository, paymentHistoryRepository) {
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.spptRepository = spptRepository;
    /** @private */
    this.paymentHistoryRepository = paymentHistoryRepository;
  }

  /**
   * Fetches the total count of SPPTs issued year-to-date.
   * @returns {number}
   */
  getTotalSPPTIssuedYTD() {
    WK.security().checkPermission('pbb.view');
    const currentYear = new Date().getFullYear();
    const metricName = `pbb.sppt.issued.ytd.${currentYear}`;
    return this.analyticsService.getDashboardData(metricName) || this.spptRepository.findAll({ taxYear: currentYear }).length;
  }

  /**
   * Fetches the total revenue collected year-to-date.
   * @returns {number}
   */
  getTotalRevenueCollectedYTD() {
    WK.security().checkPermission('pbb.view');
    const currentYear = new Date().getFullYear();
    const metricName = `pbb.revenue.collected.ytd.${currentYear}`;
    // This would ideally come from Analytics. For direct calculation:
    const paidSPPTs = this.spptRepository.findAll({ taxYear: currentYear, status: 'PAID' });
    const totalRevenue = paidSPPTs.reduce((sum, sppt) => sum + sppt.taxAmount, 0);
    return this.analyticsService.getDashboardData(metricName) || totalRevenue;
  }

  /**
   * Fetches the total amount of outstanding arrears.
   * @returns {number}
   */
  getTotalArrears() {
    WK.security().checkPermission('pbb.arrears.view');
    const overdueSPPTs = this.spptRepository.findAll({ status: 'OVERDUE' });
    const totalArrears = overdueSPPTs.reduce((sum, sppt) => sum + sppt.taxAmount, 0);
    return this.analyticsService.getDashboardData('pbb.total.arrears') || totalArrears;
  }

  /**
   * Fetches the distribution of SPPT payment statuses.
   * @returns {object} An object with status counts (e.g., { ISSUED: 100, PAID: 50, OVERDUE: 20 }).
   */
  getPaymentStatusDistribution() {
    WK.security().checkPermission('pbb.view');
    const metricName = 'pbb.payment.status.distribution';
    return this.analyticsService.getDashboardData(metricName) || {}; // Placeholder
  }

  /**
   * Fetches a list of taxpayers with the highest arrears.
   * @returns {object[]}
   */
  getTopArrearsByTaxpayer() {
    WK.security().checkPermission('pbb.arrears.view');
    const metricName = 'pbb.top.arrears.taxpayer';
    return this.analyticsService.getDashboardData(metricName) || []; // Placeholder
  }
}