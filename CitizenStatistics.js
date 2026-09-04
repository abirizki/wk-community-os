/**
 * @class CitizenStatistics
 * @description Provides aggregated statistical data for the Citizen package.
 */
class CitizenStatistics {
  /**
   * @param {CitizenRepository} citizenRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(citizenRepository, analyticsService) {
    /** @private */
    this.repository = citizenRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('citizen_stats');
    /** @private */
    this.logger = WK.logger('CitizenStatistics');
    /** @private */
    this.defaultCacheTTL = 3600; // 1 hour for demographic data
  }

  /**
   * Retrieves a high-level summary of citizen statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalCitizens: this.repository.count({ ...filters, status: { ne: 'DECEASED' } }),
      activeCitizens: this.repository.count({ ...filters, status: 'ACTIVE' }),
      inactiveCitizens: this.repository.count({ ...filters, status: 'INACTIVE' }),
      deceasedCitizens: this.repository.count({ ...filters, status: 'DECEASED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Calculates the distribution of citizens by gender.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getGenderDistribution(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    const genders = ['MALE', 'FEMALE']; // From CitizenSeeder
    const distribution = genders.map(gender => ({
      name: gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
      value: this.repository.count({ ...filters, gender: gender, status: { ne: 'DECEASED' } })
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of citizens by age group.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getAgeDistribution(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    const now = new Date();
    const getYear = (yearsAgo) => new Date(now.getFullYear() - yearsAgo, now.getMonth(), now.getDate()).toISOString().split('T')[0];

    const ageGroups = [
      { name: '0-5', value: this.repository.count({ ...filters, dateOfBirth: { gte: getYear(5) }, status: { ne: 'DECEASED' } }) },
      { name: '6-17', value: this.repository.count({ ...filters, dateOfBirth: { gte: getYear(17), lt: getYear(5) }, status: { ne: 'DECEASED' } }) },
      { name: '18-35', value: this.repository.count({ ...filters, dateOfBirth: { gte: getYear(35), lt: getYear(17) }, status: { ne: 'DECEASED' } }) },
      { name: '36-55', value: this.repository.count({ ...filters, dateOfBirth: { gte: getYear(55), lt: getYear(35) }, status: { ne: 'DECEASED' } }) },
      { name: '56+', value: this.repository.count({ ...filters, dateOfBirth: { lt: getYear(55) }, status: { ne: 'DECEASED' } }) },
    ];
    return ageGroups.filter(g => g.value > 0);
  }

  /**
   * Calculates the distribution of citizens by education level.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getEducationDistribution(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    const levels = ['TIDAK_SEKOLAH', 'SD', 'SMP', 'SMA', 'DIPLOMA', 'SARJANA', 'MAGISTER', 'DOKTOR'];
    const distribution = levels.map(level => ({
      name: level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, educationLevel: level, status: { ne: 'DECEASED' } })
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of citizens by occupation.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getOccupationDistribution(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    const occupations = ['PELAJAR', 'PNS', 'TNI_POLRI', 'SWASTA', 'WIRASWASTA', 'PETANI', 'IRT', 'TIDAK_BEKERJA'];
    const distribution = occupations.map(occupation => ({
      name: occupation.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, occupation: occupation, status: { ne: 'DECEASED' } })
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Retrieves the monthly trend of new citizen registrations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getRegistrationTrend(filters = {}) {
    WK.security().checkPermission('citizen.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'citizen_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }
}