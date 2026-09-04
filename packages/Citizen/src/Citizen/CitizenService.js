/**
 * Provides citizen registry operations.
 * @class
 */
class CitizenService {
  /**
   * Creates a citizen service.
   * @param {Object} repository - Data repository.
   * @param {Object} auditService - Optional audit service.
   */
  constructor(repository, auditService) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
    this.auditService = auditService || null;
  }

  /**
   * Creates a citizen record.
   * @param {Object} payload - Citizen payload.
   * @returns {Object} Created citizen.
   */
  create(payload) {
    const citizen = new CitizenEntity(payload);
    if (this.hasDuplicateNik(citizen.nik)) {
      throw new Error('Duplicate NIK');
    }
    if (this.hasDuplicateKk(citizen.kkNumber)) {
      throw new Error('Duplicate KK');
    }
    this.items.set(citizen.citizenId, citizen);
    if (this.auditService) {
      this.auditService.record('citizen.create', { citizenId: citizen.citizenId });
    }
    return citizen;
  }

  /**
   * Reads a citizen record.
   * @param {string} citizenId - Citizen identifier.
   * @returns {Object|null} Citizen record.
   */
  read(citizenId) {
    return this.items.get(citizenId) || null;
  }

  /**
   * Updates a citizen record.
   * @param {string} citizenId - Citizen identifier.
   * @param {Object} payload - Update payload.
   * @returns {Object|null} Updated citizen.
   */
  update(citizenId, payload) {
    const current = this.items.get(citizenId);
    if (!current) {
      return null;
    }
    const updated = Object.assign(current, payload);
    this.items.set(citizenId, updated);
    return updated;
  }

  /**
   * Deletes a citizen record.
   * @param {string} citizenId - Citizen identifier.
   * @returns {boolean} True when deleted.
   */
  delete(citizenId) {
    return this.items.delete(citizenId);
  }

  /**
   * Finds citizens by keyword.
   * @param {string} keyword - Search keyword.
   * @returns {Array} Matching citizens.
   */
  search(keyword) {
    const term = (keyword || '').toLowerCase();
    return Array.from(this.items.values()).filter((citizen) => {
      const searchable = [citizen.fullName, citizen.nik, citizen.kkNumber, citizen.village, citizen.rt, citizen.rw].join(' ').toLowerCase();
      return searchable.includes(term);
    });
  }

  /**
   * Filters citizens by a predicate.
   * @param {Function} predicate - Filter callback.
   * @returns {Array} Matching citizens.
   */
  filter(predicate) {
    return Array.from(this.items.values()).filter(predicate);
  }

  /**
   * Detects duplicate NIK values.
   * @param {string} nik - NIK value.
   * @returns {boolean} True when duplicate exists.
   */
  hasDuplicateNik(nik) {
    return Array.from(this.items.values()).some((citizen) => citizen.nik === nik);
  }

  /**
   * Detects duplicate KK values.
   * @param {string} kkNumber - KK number.
   * @returns {boolean} True when duplicate exists.
   */
  hasDuplicateKk(kkNumber) {
    return Array.from(this.items.values()).some((citizen) => citizen.kkNumber === kkNumber);
  }

  /**
   * Calculates age from birth date.
   * @param {string} birthDate - Date string.
   * @returns {number} Age in years.
   */
  calculateAge(birthDate) {
    if (!birthDate) {
      return 0;
    }
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) {
      return 0;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  }

  /**
   * Returns citizen statistics.
   * @returns {Object} Statistics payload.
   */
  getStatistics() {
    const citizens = Array.from(this.items.values());
    return {
      total: citizens.length,
      ageDistribution: this.groupBy(citizens, 'ageGroup'),
      genderDistribution: this.groupBy(citizens, 'gender'),
      educationDistribution: this.groupBy(citizens, 'education'),
      occupationDistribution: this.groupBy(citizens, 'occupation'),
      religionDistribution: this.groupBy(citizens, 'religion'),
      residentStatusDistribution: this.groupBy(citizens, 'residentStatus')
    };
  }

  /**
   * Groups citizen values by a field.
   * @param {Array} citizens - Citizens array.
   * @param {string} field - Field name.
   * @returns {Object} Grouped object.
   */
  groupBy(citizens, field) {
    const result = {};
    citizens.forEach((citizen) => {
      const value = field === 'ageGroup' ? this.getAgeGroup(citizen.birthDate) : citizen[field] || 'Unknown';
      result[value] = (result[value] || 0) + 1;
    });
    return result;
  }

  /**
   * Gets age group label.
   * @param {string} birthDate - Date string.
   * @returns {string} Age group.
   */
  getAgeGroup(birthDate) {
    const age = this.calculateAge(birthDate);
    if (age < 18) {
      return 'Under 18';
    }
    if (age < 35) {
      return '18-34';
    }
    if (age < 60) {
      return '35-59';
    }
    return '60+';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CitizenService, CitizenEntity };
}
