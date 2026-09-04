/**
 * Provides RW entity support for the System package.
 * @class
 */
class RWService {
  /**
   * Creates an RW service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates an RW entity.
   * @param {Object} payload - RW payload.
   * @returns {Object} RW record.
   */
  create(payload) {
    const item = Object.assign({ id: `rw-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RWService };
}
