/**
 * @file CitizenStatistics.js
 * @description Analytics and aggregation layer for Citizen demography data.
 */

const { CitizenConstants } = require('./CitizenEntity.js');

class CitizenStatistics {
  constructor(repository) {
    this.repository = repository;
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('citizen_stats') : null;
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
    this.analytics = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null;
  }

  _checkPermission() {
    if (this.security) {
      this.security.checkPermission('citizen.statistics.view');
    }
  }

  _getCacheKey(method, filters = {}) {
    return `${method}_${JSON.stringify(filters)}`;
  }

  getSummary(filters = {}) {
    this._checkPermission();
    
    const cacheKey = this._getCacheKey('getSummary', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const db = this.repository.dbAdapter;
    let citizenRecords = [];
    let familyRecords = [];
    
    if (db && typeof db.search === 'function') {
      citizenRecords = db.search(this.repository.tableName, filters);
      // Simplify family count matching filter context (in real scenario, families would be joined or filtered properly)
      familyRecords = db.search(this.repository.familyTable, {});
    }

    const totalCitizens = citizenRecords.length;
    const totalFamilies = familyRecords.length;
    
    const activeCitizens = citizenRecords.filter(c => c.residencyStatus === 'ACTIVE').length;
    const temporaryCitizens = citizenRecords.filter(c => c.residencyStatus === 'TEMPORARY').length;

    const summary = {
      totalCitizens,
      totalFamilies,
      activeCitizens,
      temporaryCitizens
    };

    if (this.cache) this.cache.set(cacheKey, summary, 300); // 5 minutes TTL
    return summary;
  }

  getGenderDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getGenderDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const dist = CitizenConstants.GENDERS.map(g => ({
      gender: g,
      count: records.filter(r => r.gender === g).length
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600); // 1 hour TTL
    return dist;
  }

  getResidencyDistribution(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getResidencyDistribution', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    const dist = CitizenConstants.RESIDENCY_STATUSES.map(s => ({
      status: s,
      count: records.filter(r => r.residencyStatus === s).length
    }));

    if (this.cache) this.cache.set(cacheKey, dist, 3600);
    return dist;
  }

  getAgeDemographics(filters = {}) {
    this._checkPermission();

    const cacheKey = this._getCacheKey('getAgeDemographics', filters);
    if (this.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, filters);
    }

    let balita = 0; // 0-5
    let remaja = 0; // 6-17
    let dewasa = 0; // 18-59
    let lansia = 0; // 60+

    const currentYear = new Date().getFullYear();

    records.forEach(r => {
      if (!r.birthDate) return;
      const birthYear = new Date(r.birthDate).getFullYear();
      const age = currentYear - birthYear;
      
      if (age <= 5) balita++;
      else if (age <= 17) remaja++;
      else if (age <= 59) dewasa++;
      else lansia++;
    });

    const result = [
      { category: 'Balita (0-5)', count: balita },
      { category: 'Remaja (6-17)', count: remaja },
      { category: 'Dewasa (18-59)', count: dewasa },
      { category: 'Lansia (60+)', count: lansia }
    ];

    if (this.cache) this.cache.set(cacheKey, result, 3600);
    return result;
  }

  getRecentRegistrations(limit = 5) {
    this._checkPermission();

    const db = this.repository.dbAdapter;
    let records = [];
    if (db && typeof db.search === 'function') {
      records = db.search(this.repository.tableName, {});
    }

    // Sort by createdAt descending
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recent = records.slice(0, limit);

    // CRITICAL: Must use toDisplay() to mask PII (NIK)
    const { Citizen } = require('./CitizenEntity.js');
    return recent.map(r => {
      const entity = Citizen.fromObject(r);
      return entity.toDisplay();
    });
  }
}

module.exports = { CitizenStatistics };

