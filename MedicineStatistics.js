/**
 * @class MedicineStatistics
 * @description Provides aggregated statistical data for the Medicine master data package.
 */
class MedicineStatistics {
  /**
   * @param {MedicineRepository} medicineRepository
   * @param {AnalyticsService} analyticsService
   */
  constructor(medicineRepository, analyticsService) {
    /** @private */
    this.repository = medicineRepository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('medicine_stats');
    /** @private */
    this.logger = WK.logger('MedicineStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes
  }

  /**
   * Retrieves a high-level summary of medicine master data statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Returning cached summary data for key: ${cacheKey}`);
      return cachedData;
    }

    const summary = {
      totalMedicines: this.repository.count(filters),
      activeMedicines: this.repository.count({ ...filters, status: 'ACTIVE' }),
      inactiveMedicines: this.repository.count({ ...filters, status: 'INACTIVE' }),
      archivedMedicines: this.repository.count({ ...filters, status: 'ARCHIVED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    this.logger.info(`Generated and cached new summary data for key: ${cacheKey}`);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new medicine master record creations.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getCreatedTrend(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'medicine_master_created',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of medicine statuses.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getStatusDistribution(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    const statuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
    const distribution = statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, status: status }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of medicine types.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getTypeDistribution(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    const types = ['GENERIK', 'PATEN', 'HERBAL'];
    const distribution = types.map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, medicineType: type }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of medicine dosage forms.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getDosageFormDistribution(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    // This would ideally use a GROUP BY query. Simulating for now.
    // In a real scenario, this list would come from MasterData.
    const forms = ['TABLET', 'CAPSULE', 'SYRUP', 'DROPS', 'CREAM', 'OINTMENT', 'INJECTION', 'SUPPOSITORY'];
    const distribution = forms.map(form => ({
      name: form.charAt(0).toUpperCase() + form.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, dosageForm: form }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of medicine categories.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getCategoryDistribution(filters = {}) {
    WK.security().checkPermission('medicine.statistics.view');
    const categories = ['ANALGESIC', 'ANTIBIOTIC', 'ANTIHISTAMINE', 'VITAMIN', 'VACCINE'];
    const distribution = categories.map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      value: this.repository.count({ ...filters, category: category }),
    }));
    return distribution.filter(d => d.value > 0);
  }
}