/**
 * Provides RT entity support for the System package.
 * @class
 */
class RTService {
  /**
   * Creates an RT service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates an RT entity.
   * @param {Object} payload - RT payload.
   * @returns {Object} RT record.
   */
  create(payload) {
    const item = Object.assign({ id: `rt-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RTService };
}
