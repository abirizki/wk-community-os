/**
 * @file PBBStatistics.js
 * @description Analytics and aggregation layer for PBB tax management module.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

const { PBBConstants, PBBPayment } = require('./PBBEntity.js');

class PBBStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('pbb_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('pbb.view.all');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Summary of tax realization: total target, realized amount, compliance rate, and overdue count.
   * @param {Object} filters
   * @returns {Object}
   */
  getTaxRealizationSummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getTaxRealizationSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const bills = this.repository ? this.repository.findAllBills() : [];

    let totalTargetAmount = 0;
    let totalRealizedAmount = 0;
    let overdueCount = 0;

    bills.forEach(b => {
      totalTargetAmount += Number(b.taxAmount || 0);
      if (b.status === 'PAID') {
        totalRealizedAmount += Number(b.taxAmount || 0);
      }
      if (b.status === 'OVERDUE') {
        overdueCount++;
      }
    });

    const complianceRate = totalTargetAmount > 0
      ? Number(((totalRealizedAmount / totalTargetAmount) * 100).toFixed(2))
      : 0;

    const result = {
      totalTargetAmount,
      totalRealizedAmount,
      complianceRate,
      overdueCount,
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  /**
   * Distribution of SPPT bills by status (UNPAID, PENDING_VERIFICATION, PAID, OVERDUE).
   * @param {Object} filters
   * @returns {Array<Object>}
   */
  getComplianceDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getComplianceDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const bills = this.repository ? this.repository.findAllBills() : [];

    const dist = PBBConstants.PBB_STATUSES.map(st => ({
      status: st,
      count: bills.filter(b => b.status === st).length,
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  /**
   * Recent payment confirmations sanitized without internal audit fields.
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getRecentPayments(limit = 5) {
    this._checkPermission();

    const payments = this.repository ? this.repository.findAllPayments() : [];

    // Sort descending by createdAt or verifiedAt
    payments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return payments.slice(0, limit).map(p => {
      const pEntity = p instanceof PBBPayment ? p : PBBPayment.fromObject(p);
      const dto = pEntity.toObject();
      delete dto.deletedAt;
      delete dto.deletedBy;
      return {
        id: dto.id,
        billId: dto.billId,
        nop: dto.nop,
        paidAmount: dto.paidAmount,
        paymentProofUrl: dto.paymentProofUrl,
        notes: dto.notes,
        verifiedBy: dto.verifiedBy || 'Belum Diverifikasi',
        verifiedAt: dto.verifiedAt || null,
        createdAt: dto.createdAt,
      };
    });
  }
}

module.exports = { PBBStatistics };
