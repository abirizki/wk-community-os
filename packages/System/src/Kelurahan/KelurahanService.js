/**
 * Provides Kelurahan entity support for the System package.
 * @class
 */
class KelurahanService {
  /**
   * Creates a Kelurahan service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates a Kelurahan entity.
   * @param {Object} payload - Kelurahan payload.
   * @returns {Object} Kelurahan record.
   */
  create(payload) {
    const item = Object.assign({ id: `kel-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KelurahanService };
}
