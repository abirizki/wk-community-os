/**
 * @file LetterStatistics.js
 * @description Analytics and aggregation layer for Letter (Surat Pengantar) module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { LetterConstants } = require('./LetterEntity.js');

class LetterStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('letter_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('letter.statistics.view');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Summary of letter services: total submissions, waiting approval queue, and completed.
   * @param {Object} filters
   * @returns {Object}
   */
  getServiceSummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getServiceSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const letters = this.repository ? this.repository.findAllLetters() : [];

    let totalSubmitted = 0;
    let waitingApproval = 0;
    let completed = 0;
    let rejected = 0;
    let draft = 0;

    const waitingStatuses = ['WAITING_RT', 'WAITING_RW', 'WAITING_KELURAHAN'];

    letters.forEach(letter => {
      if (letter.status !== 'DRAFT') {
        totalSubmitted++;
      } else {
        draft++;
      }

      if (waitingStatuses.includes(letter.status)) {
        waitingApproval++;
      } else if (letter.status === 'APPROVED') {
        completed++;
      } else if (letter.status === 'REJECTED') {
        rejected++;
      }
    });

    const result = {
      totalSubmitted,
      waitingApproval,
      completed,
      rejected,
      draft,
      totalAll: letters.length,
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  /**
   * Distribution of letter requests by type (SKTM, DOMISILI, etc.).
   * @param {Object} filters
   * @returns {Array<Object>}
   */
  getRequestsByType(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getRequestsByType', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const letters = this.repository ? this.repository.findAllLetters() : [];

    const dist = LetterConstants.LETTER_TYPES.map(t => ({
      type: t,
      count: letters.filter(l => l.type === t).length,
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  /**
   * Recent letter submissions for dashboard table widget.
   * Strips internal metadata and sensitive audit fields for presentation safety.
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getRecentSubmissions(limit = 5) {
    this._checkPermission();

    const letters = this.repository ? this.repository.findAllLetters() : [];

    // Sort by createdAt descending
    letters.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return letters.slice(0, limit).map(l => ({
      id: l.id,
      createdAt: l.createdAt ? l.createdAt.slice(0, 10) : '',
      type: l.type,
      purpose: l.purpose,
      status: l.status,
      letterNumber: l.letterNumber || '-',
    }));
  }
}

module.exports = { LetterStatistics };

