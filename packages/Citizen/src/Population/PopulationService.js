/**
 * Provides population support operations.
 * @class
 */
class PopulationService {
  /**
   * Creates a population service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Registers population information.
   * @param {Object} payload - Population payload.
   * @returns {Object} Population record.
   */
  register(payload) {
    const item = Object.assign({ id: `population-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PopulationService };
}
