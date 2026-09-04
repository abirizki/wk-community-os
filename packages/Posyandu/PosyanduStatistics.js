/**
 * @file PosyanduStatistics.js
 * @description Analytics and aggregation layer for Posyandu (Community Health) module.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduConstants, PosyanduMember, PosyanduRecord } = require('./PosyanduEntity.js');

class PosyanduStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('posyandu_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('posyandu.statistics.view');
    }
  }

  _getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Summary of community health metrics: total members, stunting cases, malnutrition cases, and high-risk pregnancies.
   * @param {Object} filters
   * @returns {Object}
   */
  getHealthSummary(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getHealthSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const members = this.repository ? this.repository.findAllMembers() : [];
    const records = this.repository ? this.repository.findAllRecords() : [];

    let totalMembers = members.length;
    let stuntingCases = 0;
    let malnutritionCases = 0;

    // Track unique high risk pregnancy members
    const highRiskBumilSet = new Set();

    records.forEach(r => {
      if (r.stuntingStatus === 'STUNTED' || r.stuntingStatus === 'SEVERELY_STUNTED') {
        stuntingCases++;
      }
      if (r.nutritionStatus === 'GIZI_BURUK' || r.nutritionStatus === 'GIZI_KURANG') {
        malnutritionCases++;
      }

      if (r.isHighRisk) {
        const m = members.find(mem => mem.id === r.memberId);
        if (m && m.targetGroup === 'IBU_HAMIL') {
          highRiskBumilSet.add(m.id);
        }
      }
    });

    const result = {
      totalMembers,
      stuntingCases,
      malnutritionCases,
      highRiskPregnancies: highRiskBumilSet.size,
    };

    if (this.cache) this.cache.set(cacheKey, result, 300); // 5 minutes TTL
    return result;
  }

  /**
   * Distribution of balita nutritional statuses (GIZI_BAIK, GIZI_KURANG, GIZI_BURUK, GIZI_LEBIH).
   * @param {Object} filters
   * @returns {Array<Object>}
   */
  getNutritionDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getNutritionDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const records = this.repository ? this.repository.findAllRecords() : [];

    const dist = PosyanduConstants.NUTRITION_STATUSES.map(st => ({
      status: st,
      count: records.filter(r => r.nutritionStatus === st).length,
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  /**
   * Recent visits requiring follow-up or flagged as high risk.
   * Mandatorily invokes PosyanduMember.toDisplay() / PosyanduRecord.toDisplay() to enforce PHI/PII protection.
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getRecentFollowUps(limit = 5) {
    this._checkPermission();

    const allRecords = this.repository ? this.repository.findAllRecords() : [];

    // Filter follow-up or high-risk records
    const followUps = allRecords.filter(r => r.status === 'FOLLOW_UP_NEEDED' || r.isHighRisk === true);

    // Sort descending by visitDate
    followUps.sort((a, b) => new Date(b.visitDate || 0) - new Date(a.visitDate || 0));

    return followUps.slice(0, limit).map(r => {
      const recEntity = r instanceof PosyanduRecord ? r : PosyanduRecord.fromObject(r);
      const displayedRec = recEntity.toDisplay();

      const member = this.repository ? this.repository.findMemberById(r.memberId) : null;
      let targetGroup = '-';
      if (member) {
        const memberEntity = member instanceof PosyanduMember ? member : PosyanduMember.fromObject(member);
        targetGroup = memberEntity.targetGroup;
      }

      return {
        id: displayedRec.id,
        visitDate: displayedRec.visitDate,
        targetGroup,
        status: displayedRec.status,
        riskNotes: displayedRec.riskNotes || (displayedRec.isHighRisk ? 'Risiko Kesehatan Terdeteksi' : '-'),
      };
    });
  }
}

module.exports = { PosyanduStatistics };

