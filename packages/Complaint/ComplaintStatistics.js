/**
 * @file ComplaintStatistics.js
 * @description Analytics and aggregation layer for Complaint (Pengaduan Warga) module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { ComplaintConstants, Complaint } = require('./ComplaintEntity.js');

class ComplaintStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('complaint_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('complaint.statistics.view');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Summary of complaints: total, pending review, in progress, and completed.
   * @param {Object} filters
   * @returns {Object}
   */
  getComplaintSummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getComplaintSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const complaints = this.repository ? this.repository.findAllComplaints() : [];

    let total = complaints.length;
    let pendingReview = 0; // NEW, VERIFIED
    let inProgress = 0;    // IN_PROGRESS, REOPENED
    let completed = 0;     // RESOLVED, CLOSED
    let rejected = 0;      // REJECTED

    complaints.forEach(c => {
      if (c.status === 'NEW' || c.status === 'VERIFIED') {
        pendingReview++;
      } else if (c.status === 'IN_PROGRESS' || c.status === 'REOPENED') {
        inProgress++;
      } else if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        completed++;
      } else if (c.status === 'REJECTED') {
        rejected++;
      }
    });

    const result = {
      total,
      pendingReview,
      inProgress,
      completed,
      rejected,
      resolutionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  /**
   * Distribution of complaints by category (INFRA, LING, SOS, AMAN, PJU, DRAIN, SAMPAH).
   * @param {Object} filters
   * @returns {Array<Object>}
   */
  getCategoryDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getCategoryDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const complaints = this.repository ? this.repository.findAllComplaints() : [];

    const dist = ComplaintConstants.COMPLAINT_CATEGORIES.map(cat => ({
      category: cat,
      count: complaints.filter(c => c.category === cat).length,
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  /**
   * Recent citizen complaints for dashboard display.
   * Mandatorily invokes Complaint.toDisplay() to enforce anonymity and PII masking.
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getRecentComplaints(limit = 5) {
    this._checkPermission();

    const rawList = this.repository ? this.repository.findAllComplaints() : [];

    // Sort descending by createdAt
    rawList.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return rawList.slice(0, limit).map(item => {
      // Ensure entity instance so toDisplay() is available
      const entity = item instanceof Complaint ? item : Complaint.fromObject(item);
      const displayed = entity.toDisplay();

      return {
        id: displayed.id,
        createdAt: displayed.createdAt ? displayed.createdAt.slice(0, 10) : '',
        citizenId: displayed.citizenId,
        title: displayed.title,
        category: displayed.category,
        priority: displayed.priority,
        location: displayed.location,
        status: displayed.status,
      };
    });
  }
}

module.exports = { ComplaintStatistics };

